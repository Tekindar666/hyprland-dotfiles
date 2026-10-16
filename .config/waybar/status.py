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
            "text": f"󰃠 {percent}%",
            "tooltip": "Monitor brightness — scroll to adjust",
        }


def gmail():
    # Account selection is machine-local, never checked into the dotfiles.
    config = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    account = (config / "waybar-gmail-account").read_text().strip()
    if not account:
        raise ValueError("Missing Gmail account")
    result = json.loads(run(
        "gog", "--account", account, "--json", "--no-input",
        "gmail", "labels", "get", "INBOX",
    ))
    label = result["label"]
    if label["id"] != "INBOX":
        raise ValueError("Unexpected Gmail label")
    # Gmail omits zero-valued count fields from its JSON response.
    count = label.get("messagesUnread", 0)
    if type(count) is not int or count < 0:
        raise ValueError("Invalid unread count")
    return {"text": f"󰇮 {count}", "tooltip": f"Unread inbox messages: {count}"}


def status(module, direction=None):
    try:
        if module == "brightness":
            return brightness(direction)
        return gmail()
    except (OSError, subprocess.SubprocessError, ValueError, KeyError, ZeroDivisionError):
        icon = "󰃠" if module == "brightness" else "󰇮"
        hint = "DDC monitor unavailable" if module == "brightness" else (
            "Gmail unavailable — check gog authorization and ~/.config/waybar-gmail-account"
        )
        return {"text": f"{icon} —", "tooltip": hint, "class": "unavailable"}


if __name__ == "__main__":
    module = sys.argv[1]
    direction = sys.argv[2] if len(sys.argv) > 2 else None
    if module not in {"brightness", "gmail"} or direction not in {None, "+", "-"}:
        raise SystemExit("Usage: status.py {brightness [+-]|gmail}")
    print(json.dumps(status(module, direction)))
