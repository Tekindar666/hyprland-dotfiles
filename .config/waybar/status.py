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


def brightness(direction=None):
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
            "tooltip": "DDC monitor unavailable",
            "class": "unavailable",
        }


if __name__ == "__main__":
    module = sys.argv[1]
    direction = sys.argv[2] if len(sys.argv) > 2 else None
    if module != "brightness" or direction not in {None, "+", "-"}:
        raise SystemExit("Usage: status.py brightness [+-]")
    print(json.dumps(status(direction)))
