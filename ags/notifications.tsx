import { Astal } from "ags/gtk4";
import { Accessor, createBinding, For } from "ags";
import Gtk from "gi://Gtk?version=4.0";
import Notifd from "gi://AstalNotifd";

export function Notifications({ visible }: { visible: Accessor<boolean> }) {
  const notifd = Notifd.get_default();
  const notifications = createBinding(notifd, "notifications").as((items) => [...items].reverse());
  const { TOP } = Astal.WindowAnchor;

  return (
    <window visible={visible} layer={Astal.Layer.OVERLAY} exclusivity={Astal.Exclusivity.IGNORE} anchor={TOP} marginTop={34}>
      <box class="right-panel notification-panel" orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <label class="panel-title" label="Notifications" halign={Gtk.Align.CENTER} />
        <button label="Clear all" halign={Gtk.Align.END} onClicked={() => notifications().forEach((notification) => notification.dismiss())} />
        <scrolledwindow minContentHeight={300} maxContentHeight={600}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <For each={notifications}>
              {(notification) => (
                <box class="notification-item" orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                  <box spacing={8}>
                    <label class="notification-app" label={notification.appName || "Notification"} hexpand halign={Gtk.Align.START} />
                    <button label="×" onClicked={() => notification.dismiss()} />
                  </box>
                  <label label={notification.summary} halign={Gtk.Align.START} wrap />
                  <label class="notification-body" label={notification.body} halign={Gtk.Align.START} wrap />
                </box>
              )}
            </For>
          </box>
        </scrolledwindow>
      </box>
    </window>
  );
}
