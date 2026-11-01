import { createState } from "ags";
import Gtk from "gi://Gtk?version=4.0";

type SliderProps = {
  icon: string;
  fetchValue: () => Promise<number>;
  onApply: (value: number) => void;
};

export function Slider({ icon, fetchValue, onApply }: SliderProps) {
  const [currValue, setCurrValue] = createState(0);
  let applyTimer: ReturnType<typeof setTimeout> | undefined;

  void fetchValue()
    .then(setCurrValue)
    .catch((error) => console.error("failed to fetch slider value", error));

  return (
    <box class="slider-row" spacing={12} halign={Gtk.Align.CENTER}>
      <label
        class="slider-icon"
        label={icon}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <label
        class="slider-value"
        label={currValue((value) => `${Math.round(value)}%`)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <slider
        min={0}
        max={100}
        widthRequest={240}
        hexpand
        value={currValue}
        onChangeValue={({ value }: { value: number }) => {
          setCurrValue(value);

          if (applyTimer) clearTimeout(applyTimer);
          applyTimer = setTimeout(() => {
            onApply(Math.round(value));
            applyTimer = undefined;
          }, 200);
        }}
      />
    </box>
  );
}
