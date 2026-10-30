import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import { createPoll } from "ags/time";
import { Accessor, createBinding, For } from "ags";
import Hyprland from "gi://AstalHyprland";
import { System } from "./system";

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
  css: `
    * {
      font-family: "JetBrainsMono Nerd Font";
      font-size: 16px;
      font-weight: 600;
    }

    window {
      min-height: 34px;
      background: transparent;
      color: #d8dee9;
    }

    .workspaces {
      margin-left: 14px;
    }

    .clock {
      padding: 0 9px;
    }

    .system {
      margin-right: 14px;
    }

    .system .module {
      padding: 0 9px;
    }

    .system .muted:not(.bluetooth),
    .system .unavailable,
    .system .disconnected,
    .system .critical {
      color: #bf616a;
    }

    .workspaces button {
      padding: 0 3px;
      margin: 5px 8px;
      color: #8995a6;
      background: transparent;
      border: none;
      border-bottom: 1px solid transparent;
      border-radius: 0;
      box-shadow: none;
      text-shadow: none;
    }

    .workspaces button.active {
      color: #88c0d0;
      border-bottom-color: #88c0d0;
    }
  `,
  main() {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

    // clock module
    const clock: Accessor<string> = createPoll("", 1000, ["date", "+%a %d %H:%M"]);

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
          <label $type="center" class="clock" label={clock} />
          <box $type="end">
            <System />
          </box>
        </centerbox>
      </window>
    );
  },
});
