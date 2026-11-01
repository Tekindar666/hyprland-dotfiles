import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor } from "ags";
import { Slider } from "./slider";
import { execAsync } from "ags/process";
import { applyBrightness, fetchBrightness } from "./brightness";

async function fetchVolume(): Promise<number> {
  const output = await execAsync(["wpctl", "get-volume", "@DEFAULT_AUDIO_SINK"]);
  const match = output.match(/Volume:\s*([\d.]+)/);

  if (!match) {
    throw new Error("error getting wpctl outout");
  }

  const volume = Number(match[1]);
  return Math.round(Math.min(100, Math.max(0, volume * 100)));
}

export function RightPanel({ visible }: { visible: Accessor<boolean> }) {
  const { TOP, RIGHT, BOTTOM } = Astal.WindowAnchor;

  return (
    <window
      visible={visible}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | RIGHT | BOTTOM}
    >
      <box
        class="right-panel"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={16}
      >
        <Slider
          icon=""
          fetchValue={fetchVolume}
          onApply={(value) => {
            void execAsync(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", `${value}%`]).catch(
              console.error,
            );
          }}
        />
        <Slider
          icon="󰃠"
          fetchValue={fetchBrightness}
          onApply={(value) => {
            void applyBrightness(value).catch(console.error);
          }}
        />
      </box>
    </window>
  );
}
