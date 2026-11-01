import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import { Accessor } from "ags";
import { Slider } from "./slider";
import { execAsync } from "ags/process";
import { applyBrightness, fetchBrightness } from "./brightness";

async function fetchVolume(target: string): Promise<number> {
  const output = await execAsync(["wpctl", "get-volume", target]);
  const match = output.match(/Volume:\s*([\d.]+)/);

  if (!match) {
    throw new Error("error getting wpctl outout");
  }

  const volume = Number(match[1]);
  return Math.round(Math.min(100, Math.max(0, volume * 100)));
}

export function RightPanel({ visible }: { visible: Accessor<boolean> }) {
  const { TOP, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible={visible}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | RIGHT}
      marginTop={34}
    >
      <box class="right-panel" orientation={Gtk.Orientation.VERTICAL} spacing={16}>
        <label class="panel-title" label="Utils" halign={Gtk.Align.CENTER} />
        <Slider
          icon=""
          fetchValue={() => fetchVolume("@DEFAULT_AUDIO_SINK@")}
          onApply={(value) => {
            void execAsync(["wpctl", "set-volume", "@DEFAULT_AUDIO_SINK@", `${value}%`]).catch(
              console.error,
            );
          }}
        />
        <Slider
          icon=""
          fetchValue={() => fetchVolume("@DEFAULT_AUDIO_SOURCE@")}
          onApply={(value) => {
            void execAsync(["wpctl", "set-volume", "@DEFAULT_AUDIO_SOURCE@", `${value}%`]).catch(
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
