"""Run with: python3 -m unittest discover -s tests -p 'test_*.py'."""

import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch


SPEC = importlib.util.spec_from_file_location(
    "waybar_status", Path(__file__).resolve().parents[1] / ".config/waybar/status.py"
)
status = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(status)


class BrightnessTests(unittest.TestCase):
    def test_detection_excludes_touch_bar(self):
        screen = Path("/sys/class/backlight/intel_backlight")
        touch_bar = Path("/sys/class/backlight/appletb_backlight")
        with patch.object(Path, "iterdir", return_value=iter([touch_bar, screen])):
            self.assertEqual(status.screen_backlight(), screen)
        for devices in ([], [touch_bar]):
            with patch.object(Path, "iterdir", return_value=iter(devices)):
                self.assertIsNone(status.screen_backlight())

    def test_laptop_reads_and_adjusts_only_screen(self):
        with tempfile.TemporaryDirectory() as directory:
            device = Path(directory) / "intel_backlight"
            device.mkdir()
            (device / "brightness").write_text("25")
            (device / "max_brightness").write_text("100")
            with patch.object(status, "screen_backlight", return_value=device):
                with patch.object(status, "run") as run:
                    self.assertEqual(status.status()["text"], "brt 25%")
                    run.assert_not_called()
                    for direction, change in (("+", "+5%"), ("-", "5%-")):
                        status.status(direction)
                        run.assert_called_with(
                            "brightnessctl", "--device", "intel_backlight",
                            "--min-value=1", "set", change,
                        )

    def test_desktop_uses_ddc(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(status.os.environ, {"XDG_RUNTIME_DIR": directory}):
                with patch.object(status, "screen_backlight", return_value=None):
                    with patch.object(status, "run", return_value="VCP 10 C 40 100") as run:
                        self.assertEqual(status.status()["text"], "brt 40%")
                        run.assert_called_once_with("ddcutil", "--brief", "getvcp", "10")
                        for direction in ("+", "-"):
                            status.status(direction)
                            self.assertIn(
                                (("ddcutil", "setvcp", "10", direction, "5"),),
                                run.call_args_list,
                            )

    def test_laptop_failure_does_not_fall_back_to_ddc(self):
        with patch.object(status, "screen_backlight", return_value=Path("intel_backlight")):
            with patch.object(status, "run", side_effect=subprocess.CalledProcessError(1, "brightnessctl")) as run:
                self.assertEqual(status.status("+")["class"], "unavailable")
                self.assertEqual(run.call_count, 1)
                self.assertEqual(run.call_args.args[0], "brightnessctl")

    def test_invalid_ddc_response_is_unavailable(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(status.os.environ, {"XDG_RUNTIME_DIR": directory}):
                with patch.object(status, "screen_backlight", return_value=None):
                    for response in ("invalid", "VCP 10 C 40 0"):
                        with patch.object(status, "run", return_value=response):
                            self.assertEqual(status.status()["class"], "unavailable")
