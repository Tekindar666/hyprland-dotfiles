import { createBinding, createComputed } from "ags";
import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";
import Battery from "gi://AstalBattery";
import Bluetooth from "gi://AstalBluetooth";
import Network from "gi://AstalNetwork";
import Wp from "gi://AstalWp";

function Volume() {
  const wp = Wp.get_default();
  const volume = createBinding(wp, "defaultSpeaker", "volume");
  const muted = createBinding(wp, "defaultSpeaker", "mute");
  const text = createComputed(() =>
    muted() ? "vol muted" : `vol ${Math.round(volume() * 100)}%`
  );
  const className = muted.as((value) => value ? "module muted" : "module");

  return <label class={className} label={text} />;
}

function Microphone() {
  const wp = Wp.get_default();
  const muted = createBinding(wp, "defaultMicrophone", "mute");
  const text = muted.as((value) => value ? "mic muted" : "mic on");
  const className = muted.as((value) => value ? "module muted" : "module");

  return <label class={className} label={text} />;
}

type BrightnessStatus = {
  text: string;
  class?: string;
};

function Brightness() {
  const status = createPoll<BrightnessStatus>(
    { text: "brt —" },
    30000,
    // TODO: Replace the Waybar status.py dependency with a TypeScript brightness script.
    ["python3", `${GLib.get_home_dir()}/.config/waybar/status.py`, "brightness"],
    (stdout) => JSON.parse(stdout) as BrightnessStatus
  );

  return (
    <label
      class={status.as((value) => `module ${value.class ?? ""}`)}
      label={status.as((value) => value.text)}
    />
  );
}

function BluetoothStatus() {
  const bluetooth = Bluetooth.get_default();
  const adapter = createBinding(bluetooth, "adapter");
  const powered = createBinding(bluetooth, "isPowered");
  const text = createComputed(() => {
    if (adapter() === null) return "bt n/a";
    return powered() ? "bt" : "bt off";
  });

  return <label class="module bluetooth" label={text} />;
}

function NetworkStatus() {
  const network = Network.get_default();
  const enabled = createBinding(network, "wifi", "enabled");
  const state = createBinding(network, "wifi", "state");
  const connected = createComputed(() =>
    enabled() === true && state() === Network.DeviceState.ACTIVATED
  );
  const text = createComputed(() => {
    if (enabled() !== true) return "wifi off";
    return connected() ? "wifi" : "wifi offline";
  });
  const className = createComputed(() =>
    enabled() === true && !connected() ? "module disconnected" : "module"
  );

  return <label class={className} label={text} />;
}

function BatteryStatus() {
  const battery = Battery.get_default();
  const percentage = createBinding(battery, "percentage");
  const charging = createBinding(battery, "charging");
  const state = createBinding(battery, "state");
  const text = createComputed(() => {
    const capacity = Math.round(percentage() * 100);
    if (state() === Battery.State.FULLY_CHARGED) return `bat ${capacity}% full`;
    if (charging()) return `bat ${capacity}% charging`;
    return `bat ${capacity}%`;
  });
  const className = createComputed(() =>
    percentage() <= 0.1 && !charging() ? "module critical" : "module"
  );

  return (
    <label
      visible={createBinding(battery, "isPresent")}
      class={className}
      label={text}
    />
  );
}

export function System() {
  return (
    <box class="system">
      <Volume />
      <Microphone />
      <Brightness />
      <BluetoothStatus />
      <NetworkStatus />
      <BatteryStatus />
    </box>
  );
}
