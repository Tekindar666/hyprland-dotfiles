import GLib from "gi://GLib?version=2.0";
import { execAsync } from "ags/process";

async function getBacklightDevice(): Promise<string | undefined> {
  const output = await execAsync(["brightnessctl", "--list"]);
  const devices = [...output.matchAll(/Device '([^']+)' of class 'backlight':/g)];
  return devices.map((match) => match[1]).find((name) => name !== "appletb_backlight");
}

async function getBacklightValue(device: string): Promise<number> {
  const [currentOutput, maximumOutput] = await Promise.all([
    execAsync(["brightnessctl", "--device", device, "get"]),
    execAsync(["brightnessctl", "--device", device, "max"]),
  ]);
  const current = Number(currentOutput);
  const maximum = Number(maximumOutput);

  if (!Number.isFinite(current) || !Number.isFinite(maximum) || maximum <= 0) {
    throw new Error("Unexpected brightnessctl response");
  }

  return Math.round((current * 100) / maximum);
}

async function runDdc(args: string[]): Promise<string> {
  const runtimeDirectory = GLib.getenv("XDG_RUNTIME_DIR");
  if (!runtimeDirectory) throw new Error("XDG_RUNTIME_DIR is not set");

  return execAsync([
    "flock",
    `${runtimeDirectory}/waybar-ddc.lock`,
    "ddcutil",
    ...args,
  ]);
}

async function getDdcValue(): Promise<{ current: number; maximum: number }> {
  const output = await runDdc(["--brief", "getvcp", "10"]);
  const fields = output.trim().split(/\s+/);

  if (fields.length !== 5 || fields[0] !== "VCP" || fields[1] !== "10" || fields[2] !== "C") {
    throw new Error("Unexpected ddcutil brightness response");
  }

  const current = Number(fields[3]);
  const maximum = Number(fields[4]);
  if (!Number.isFinite(current) || !Number.isFinite(maximum) || maximum <= 0) {
    throw new Error("Invalid ddcutil brightness range");
  }

  return { current, maximum };
}

export async function fetchBrightness(): Promise<number> {
  const device = await getBacklightDevice();
  if (device) return getBacklightValue(device);

  const { current, maximum } = await getDdcValue();
  return Math.round((current * 100) / maximum);
}

export async function applyBrightness(value: number): Promise<void> {
  const percent = Math.round(Math.min(100, Math.max(0, value)));
  const device = await getBacklightDevice();

  if (device) {
    await execAsync(["brightnessctl", "--device", device, "set", `${percent}%`]);
    return;
  }

  const { maximum } = await getDdcValue();
  const rawValue = Math.round((percent * maximum) / 100);
  await runDdc(["setvcp", "10", String(rawValue)]);
}
