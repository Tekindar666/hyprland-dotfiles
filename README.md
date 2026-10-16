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

The Hyprland configuration currently targets monitor `DP-3`; adjust `.config/hypr/modules/monitors.lua` for another machine.

## Install

```bash
git clone git@github.com:Tekindar666/hyprland-dotfiles.git ~/hyprland-dotfiles
~/hyprland-dotfiles/install.sh
```

The installer symlinks user configuration into `~/.config` and the Fcitx5 theme into `~/.local/share/fcitx5/themes`. It installs the SDDM theme into system directories. To link only user configuration:

```bash
~/hyprland-dotfiles/install.sh --skip-sddm
```

Existing regular files or directories are moved to timestamped backups before linking.

The configured session expects Hyprland with Lua configuration support plus Hyprpaper, Dunst, Rofi, Waybar, NetworkManager Applet, Blueman, cliphist, Fcitx5, fcitx5-chinese-addons, and the GNOME PolicyKit agent.

## Waybar controls

Only the active workspace is shown; `w` is the default workspace on DP-3.
Click volume or microphone to toggle mute; scroll to adjust the level.
Scroll brightness to adjust the external monitor with `ddcutil` (requires I2C
access). The brightness helper targets ddcutil's default display; revisit this
selection before adding another DDC-capable monitor. Python 3 is also required.
Bluetooth and Wi-Fi show details on hover and open their settings on click.
The system tray is not displayed.

### Gmail unread inbox count

Install [gogcli](https://github.com/openclaw/gogcli) (`gog`) and follow its OAuth
setup instructions for Gmail. Prefer read-only Gmail authorization. Keep OAuth
client files and tokens outside this repository. Put the authorized account
address in `~/.config/waybar-gmail-account` (or under `$XDG_CONFIG_HOME`).
The bar reads INBOX's `messagesUnread` count every two minutes; it does not read
message bodies. Missing setup, authentication failures, or network errors show
an unavailable indicator, not zero. Authorization is a separate manual step.

Validation: `python3 tests/waybar-status.py`. After reloading Waybar, check both
audio mute controls, brightness scrolling, and Bluetooth/Wi-Fi tooltips. Check
the default workspace in a fresh Hyprland session; reloading does not move the
current workspace.
