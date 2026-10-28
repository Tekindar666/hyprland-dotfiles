# Hyprland Dotfiles

Hyprland desktop configuration for Arch Linux.

This repository owns desktop-session configuration only. Shared terminal and shell configuration remains in [dotfiles](https://github.com/Tekindar666/dotfiles), while Pi configuration remains in the private `pi-config` repository.

## Tracked configuration

- Hyprland and Hyprpaper
- Dunst
- Fcitx5 Nordic candidate-menu theme
- Rofi
- Waybar
- Nord SDDM theme

The Hyprland configuration uses the connected display’s preferred mode and 1.5× scaling. This targets single-monitor desktops and laptops; customize `.config/hypr/modules/monitors.lua` if a different scale is needed.

## Install

```bash
git clone git@github.com:Tekindar666/hyprland-dotfiles.git ~/hyprland-dotfiles
~/hyprland-dotfiles/install.sh
```

The installer symlinks user configuration into `~/.config` and the Fcitx5 theme into `~/.local/share/fcitx5/themes`. It installs the SDDM theme into system directories. To link only user configuration:

```bash
~/hyprland-dotfiles/install.sh --skip-sddm
```

To install desktop dependencies plus Ghostty and Dolphin on Arch, add `--install-packages`.
This runs a full `pacman -Syu --needed` upgrade with the package list in `install.sh`.
Zen Browser and Handy remain manual installs; their shortcuts are kept.
SDDM is optional and is not installed by this flag.

On a fresh machine, enable `NetworkManager` and `bluetooth` services if needed
(do not enable a competing network manager). PipeWire/WirePlumber provide audio.
DDC brightness still requires compatible hardware and I2C permissions; `brightnessctl`
is installed for laptops, but the current Waybar helper only supports DDC.

The wallpaper is stored at `.config/hypr/assets/wallpaper.png` and configured in
`.config/hypr/hyprpaper.conf`. The original file in Downloads is not needed after installation.

Existing regular files or directories are moved to timestamped backups before linking.

The configured session expects Hyprland with Lua configuration support plus Hyprpaper, Dunst, Rofi, Waybar, NetworkManager Applet, Blueman, cliphist, Fcitx5, fcitx5-chinese-addons, and the GNOME PolicyKit agent.

## Waybar controls

Waybar uses a transparent, minimal layout with no window title and a date/time clock.
Existing workspaces are shown, with a short blue underline on the active one.
Workspace `1` is the startup default. Use `Super+1–9` to switch numbered
workspaces and `Alt+1–9` to move a window and follow it. Lettered workspaces and
their existing shortcuts remain available.
The right side uses text labels: `vol`, `mic`, `brt`, `bt`, and `wifi`.
Hover for details; connected Bluetooth is blue, and mute/disconnection states are explicit.
Click volume or microphone to toggle mute; scroll to adjust the level.
Scroll brightness to adjust the external monitor with `ddcutil` (requires I2C
access). The brightness helper targets ddcutil's default display; revisit this
selection before adding another DDC-capable monitor. Python 3 is also required.
Bluetooth and Wi-Fi show details on hover and open their settings on click.
The system tray is not displayed.

After reloading Waybar, check both
audio mute controls, brightness scrolling, and Bluetooth/Wi-Fi tooltips. Check
the default workspace in a fresh Hyprland session; reloading does not move the
current workspace.
