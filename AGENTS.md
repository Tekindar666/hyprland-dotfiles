# Hyprland Dotfiles

## Ownership

This repository owns Arch/Hyprland desktop-session configuration: Hyprland, Hyprpaper, Dunst, Fcitx5 appearance, Rofi, Waybar, and SDDM.

Shared terminal, shell, editor, and CLI configuration belongs in `Tekindar666/dotfiles`. Pi configuration belongs in `Tekindar666/pi-config`.

## Rules

1. Keep machine-specific display settings isolated in `.config/hypr/modules/monitors.lua`.
2. Keep the installer idempotent and support linking user configuration without changing system files.
3. Track only Fcitx5 appearance settings; keep dictionaries, history, caches, and input state local.
4. Do not add shared terminal configuration or credentials.
