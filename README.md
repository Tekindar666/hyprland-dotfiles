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
