import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import { createPoll } from "ags/time";
import { execAsync } from "ags/process";
import { Accessor, createBinding, createState, For } from "ags";
import Hyprland from "gi://AstalHyprland";
import { System } from "./system";
import { RightPanel } from "./panel";
import { Notifications } from "./notifications";
import css from "./style.css";

const hyprland = Hyprland.get_default();

function Workspaces() {
  const workspaces = createBinding(hyprland, "workspaces").as((items) =>
    [...items].sort((a, b) => a.id - b.id),
  );
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

  return (
    <box class="workspaces">
      <For each={workspaces}>
        {(workspace) => (
          <button
            label={workspace.name}
            class={focusedWorkspace.as((focused) => (focused.id === workspace.id ? "active" : ""))}
            onClicked={() => {
              void execAsync([
                "hyprctl",
                "dispatch",
                `hl.dsp.focus({ workspace = ${JSON.stringify(workspace.name)} })`,
              ]).catch(console.error);
            }}
            $={(self) => {
              const gesture = new Gtk.GestureClick({ button: 3 });
              gesture.connect("pressed", () => {
                const client = hyprland.focusedClient;
                if (!client) return;

                void execAsync([
                  "hyprctl",
                  "dispatch",
                  `hl.dsp.window.move({ workspace = ${workspace.id} })`,
                ])
                  .then(() => execAsync([
                    "hyprctl",
                    "dispatch",
                    `hl.dsp.focus({ workspace = ${JSON.stringify(workspace.name)} })`,
                  ]))
                  .catch(console.error);
              });
              self.add_controller(gesture);
            }}
          />
        )}
      </For>
    </box>
  );
}

app.start({
  css,
  main() {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    // clock module
    const clock: Accessor<string> = createPoll("", 1000, ["date", "+%a %d %H:%M"]);
    const [panelVisible, setPanelVisible] = createState(false);
    const [notificationsVisible, setNotificationsVisible] = createState(false);

    RightPanel({ visible: panelVisible });
    Notifications({ visible: notificationsVisible });

    return (
      <window visible anchor={TOP | LEFT | RIGHT} exclusivity={Astal.Exclusivity.EXCLUSIVE}>
        <centerbox>
          <box $type="start">
            <Workspaces />
          </box>
          <button
            $type="center"
            class="clock"
            label={clock}
            onClicked={() => {
              setPanelVisible(false);
              setNotificationsVisible(!notificationsVisible());
            }}
          />
          <box $type="end">
            <System onModuleClicked={() => {
              setNotificationsVisible(false);
              setPanelVisible(!panelVisible());
            }} />
          </box>
        </centerbox>
      </window>
    );
  },
});
