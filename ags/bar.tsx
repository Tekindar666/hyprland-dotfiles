import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import { createPoll } from "ags/time";
import { Accessor, createBinding, createState, For } from "ags";
import Hyprland from "gi://AstalHyprland";
import { System } from "./system";
import { RightPanel } from "./panel";
import css from "./style.css";

const hyprland = Hyprland.get_default();

function Workspaces() {
  const workspaces = createBinding(hyprland, "workspaces").as((items) =>
    [...items].sort((a, b) => a.id - b.id)
  );
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

  return (
    <box class="workspaces">
      <For each={workspaces}>
        {(workspace) => (
          <button
            label={workspace.name}
            class={focusedWorkspace.as((focused) =>
              focused.id === workspace.id ? "active" : ""
            )}
            onClicked={() => hyprland.dispatch("workspace", workspace.name)}
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

    RightPanel({ visible: panelVisible });

    return (
      <window
        visible
        anchor={TOP | LEFT | RIGHT}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
      >
        <centerbox>
          <box $type="start">
            <Workspaces />
          </box>
          <button
            $type="center"
            class="clock"
            label={clock}
            onClicked={() => setPanelVisible(!panelVisible())}
          />
          <box $type="end">
            <System onModuleClicked={() => setPanelVisible(!panelVisible())} />
          </box>
        </centerbox>
      </window>
    );
  },
});
