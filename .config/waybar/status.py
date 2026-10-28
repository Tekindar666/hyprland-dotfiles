"""Small JSON adapters for Waybar's external status sources."""

import fcntl
import json
import os
from pathlib import Path
import subprocess
import sys


def run(*args):
    return subprocess.check_output(
        args, text=True, stderr=subprocess.DEVNULL, timeout=15
    )


def screen_backlight():
    # Apple exposes its Touch Bar here too; it is not the laptop screen.
    devices = sorted(Path("/sys/class/backlight").iterdir())
    return next((device for device in devices if device.name != "appletb_backlight"), None)


def brightness(direction=None):
    device = screen_backlight()
    if device is not None:
        if direction:
            change = "+5%" if direction == "+" else "5%-"
            run("brightnessctl", "--device", device.name, "--min-value=1", "set", change)
        current = int((device / "brightness").read_text())
        maximum = int((device / "max_brightness").read_text())
        percent = round(current * 100 / maximum)
        return {
            "text": f"brt {percent}%",
            "tooltip": f"Laptop screen brightness — {percent}%\nScroll to adjust",
        }

    # Serialize reads and writes: overlapping DDC requests can fail on the bus.
    lock = Path(os.environ["XDG_RUNTIME_DIR"]) / "waybar-ddc.lock"
    with lock.open("w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if direction:
            run("ddcutil", "setvcp", "10", direction, "5")
        fields = run("ddcutil", "--brief", "getvcp", "10").split()
        if fields[:3] != ["VCP", "10", "C"] or len(fields) != 5:
            raise ValueError("Unexpected brightness response")
        current, maximum = map(int, fields[3:])
        percent = round(current * 100 / maximum)
        return {
            "text": f"brt {percent}%",
            "tooltip": f"Monitor brightness — {percent}%\nScroll to adjust",
        }


def status(direction=None):
    try:
        return brightness(direction)
    except (OSError, subprocess.SubprocessError, ValueError, KeyError, ZeroDivisionError):
        return {
            "text": "brt —",
            "tooltip": "Screen brightness unavailable",
            "class": "unavailable",
        }


if __name__ == "__main__":
    module = sys.argv[1]
    direction = sys.argv[2] if len(sys.argv) > 2 else None
    if module != "brightness" or direction not in {None, "+", "-"}:
        raise SystemExit("Usage: status.py brightness [+-]")
    print(json.dumps(status(direction)))
