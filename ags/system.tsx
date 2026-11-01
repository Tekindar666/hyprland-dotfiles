import { createBinding, createComputed } from "ags";
import Gtk from "gi://Gtk?version=4.0";
import { createPoll } from "ags/time";
import Battery from "gi://AstalBattery";
import Bluetooth from "gi://AstalBluetooth";
import Network from "gi://AstalNetwork";
import Wp from "gi://AstalWp";
import { fetchBrightness } from "./brightness";

type PanelTriggerProps = { onClicked: () => void };

function addRightClick(button: Gtk.Button, onClicked: () => void) {
  const gesture = new Gtk.GestureClick({ button: 3 });
  gesture.connect("pressed", onClicked);
  button.add_controller(gesture);
}

function Volume({ onClicked }: PanelTriggerProps) {
  const wp = Wp.get_default();
  const volume = createBinding(wp, "defaultSpeaker", "volume");
  const muted = createBinding(wp, "defaultSpeaker", "mute");
  const text = createComputed(() =>
    muted() ? "vol muted" : `vol ${Math.round(volume() * 100)}%`
  );
  const className = muted.as((value) => value ? "module muted" : "module");

  return (
    <button class={className} $={(self) => addRightClick(self, onClicked)}>
      <label label={text} />
    </button>
  );
}

function Microphone({ onClicked }: PanelTriggerProps) {
  const wp = Wp.get_default();
  const muted = createBinding(wp, "defaultMicrophone", "mute");
  const text = muted.as((value) => value ? "mic muted" : "mic on");
  const className = muted.as((value) => value ? "module muted" : "module");

  return (
    <button class={className} $={(self) => addRightClick(self, onClicked)}>
      <label label={text} />
    </button>
  );
}

type BrightnessStatus = {
  text: string;
  class?: string;
};

function Brightness({ onClicked }: PanelTriggerProps) {
  const status = createPoll<BrightnessStatus>(
    { text: "brt —" },
    30000,
    async () => {
      try {
        return { text: `brt ${await fetchBrightness()}%` };
      } catch {
        return { text: "brt —", class: "unavailable" };
      }
    }
  );

  return (
    <button
      class={status.as((value) => `module ${value.class ?? ""}`)}
      $={(self) => addRightClick(self, onClicked)}
    >
      <label label={status.as((value) => value.text)} />
    </button>
  );
}

function BluetoothStatus({ onClicked }: PanelTriggerProps) {
  const bluetooth = Bluetooth.get_default();
  const adapter = createBinding(bluetooth, "adapter");
  const powered = createBinding(bluetooth, "isPowered");
  const text = createComputed(() => {
    if (adapter() === null) return "bt n/a";
    return powered() ? "bt" : "bt off";
  });

  return (
    <button
      class="module bluetooth"
      $={(self) => addRightClick(self, onClicked)}
    >
      <label label={text} />
    </button>
  );
}

function NetworkStatus({ onClicked }: PanelTriggerProps) {
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

  return (
    <button class={className} $={(self) => addRightClick(self, onClicked)}>
      <label label={text} />
    </button>
  );
}

function BatteryStatus({ onClicked }: PanelTriggerProps) {
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
    <button
      visible={createBinding(battery, "isPresent")}
      class={className}
      $={(self) => addRightClick(self, onClicked)}
    >
      <label label={text} />
    </button>
  );
}

export function System({ onModuleClicked }: { onModuleClicked: () => void }) {
  return (
    <box class="system">
      <Volume onClicked={onModuleClicked} />
      <Microphone onClicked={onModuleClicked} />
      <Brightness onClicked={onModuleClicked} />
      <BluetoothStatus onClicked={onModuleClicked} />
      <NetworkStatus onClicked={onModuleClicked} />
      <BatteryStatus onClicked={onModuleClicked} />
    </box>
  );
}
