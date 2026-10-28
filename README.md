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
Desktop DDC brightness requires compatible hardware and I2C permissions.
Laptop screen brightness uses `brightnessctl` instead.

The wallpaper is stored at `.config/hypr/assets/ign_unsplash44.png` and configured in
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
A `bat` percentage and charging status appear when a battery is available.
Hover for details; connected Bluetooth is blue, and mute/disconnection states are explicit.
Click volume or microphone to toggle mute; scroll to adjust the level.
Scroll brightness to adjust the laptop screen with `brightnessctl` when a
backlight is available (excluding the Apple Touch Bar). On laptops this always
targets the built-in screen, even with an external monitor connected. Without a
screen backlight, it uses `ddcutil` (requires I2C access) for the default external
display; revisit this selection before adding another DDC-capable monitor.
Failures show `brt —` without switching to another device. Python 3 is also required.
Bluetooth and Wi-Fi show details on hover and open their settings on click.
The system tray is not displayed.

After reloading Waybar, check both
audio mute controls, brightness scrolling, and Bluetooth/Wi-Fi tooltips. Check
the default workspace in a fresh Hyprland session; reloading does not move the
current workspace.
