#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_SDDM=false
INSTALL_PACKAGES=false

usage() {
    cat <<'EOF'
Usage: ./install.sh [--skip-sddm] [--install-packages]

Options:
  --install-packages  Install desktop packages with pacman and Vicinae via yay (AUR).
  --skip-sddm  Link user configuration without installing the SDDM theme.
  -h, --help   Show this help message.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --install-packages)
            INSTALL_PACKAGES=true
            ;;
        --skip-sddm)
            SKIP_SDDM=true
            ;;
        -h | --help)
            usage
            exit 0
            ;;
        *)
            printf 'Unknown option: %s\n' "$1" >&2
            usage >&2
            exit 1
            ;;
    esac
    shift
done

backup_if_exists() {
    local path="$1"
    if [[ -e "$path" && ! -L "$path" ]]; then
        local backup_path="${path}.backup.$(date +%Y%m%d_%H%M%S)"
        printf 'Backing up %s to %s\n' "$path" "$backup_path"
        mv "$path" "$backup_path"
    fi
}

link_path() {
    local source="$1"
    local target="$2"

    if [[ ! -e "$source" && ! -L "$source" ]]; then
        printf 'Missing source: %s\n' "$source" >&2
        exit 1
    fi

    mkdir -p "$(dirname "$target")"
    backup_if_exists "$target"
    ln -sfn "$source" "$target"
    printf 'Linked %s\n' "$target"
}

install_sddm_theme() {
    if ! command -v sddm &>/dev/null; then
        printf 'SDDM is not installed; skipping the Nord login theme\n'
        return
    fi

    local source_dir="$SCRIPT_DIR/sddm/nord"
    local target_dir="/usr/share/sddm/themes/nord-mountains"
    local install_command=(install)

    if [[ $EUID -ne 0 ]]; then
        if ! command -v sudo &>/dev/null; then
            printf 'sudo is required to install the SDDM theme\n' >&2
            exit 1
        fi
        install_command=(sudo install)
    fi

    "${install_command[@]}" -d -m 0755 "$target_dir"
    "${install_command[@]}" -m 0644 \
        "$source_dir/Main.qml" \
        "$source_dir/metadata.desktop" \
        "$source_dir/background.png" \
        "$target_dir/"
    "${install_command[@]}" -D -m 0644 \
        "$SCRIPT_DIR/sddm/zz-dotfiles-theme.conf" \
        "/etc/sddm.conf.d/zz-dotfiles-theme.conf"
    printf 'Installed the Nord SDDM theme\n'
}

install_yay() (
    if command -v yay &>/dev/null; then
        return
    fi

    # AUR builds must run as the user; makepkg requests sudo for installation.
    build_dir="$(mktemp -d)"
    trap 'rm -rf "$build_dir"' EXIT
    git clone https://aur.archlinux.org/yay-bin.git "$build_dir/yay-bin"
    cd "$build_dir/yay-bin"
    makepkg -si
)

if [[ "$INSTALL_PACKAGES" == true ]]; then
    if [[ $EUID -eq 0 ]]; then
        printf 'Run --install-packages as your normal user, not root; AUR builds use makepkg.\n' >&2
        exit 1
    fi
    if ! command -v pacman &>/dev/null; then
        printf 'Package installation requires Arch Linux and pacman\n' >&2
        exit 1
    fi
    pacman_command=(pacman)
    if [[ $EUID -ne 0 ]]; then
        if ! command -v sudo &>/dev/null; then
            printf 'sudo is required to install packages\n' >&2
            exit 1
        fi
        pacman_command=(sudo pacman)
    fi
    packages=(
        base-devel git
        hyprland hyprpaper dunst waybar
        networkmanager network-manager-applet blueman bluez bluez-utils
        wl-clipboard
        fcitx5 fcitx5-chinese-addons fcitx5-configtool polkit-gnome
        ghostty nautilus ttf-jetbrains-mono-nerd
        python ddcutil brightnessctl
        pipewire pipewire-audio pipewire-pulse wireplumber
        xdg-desktop-portal-hyprland xdg-desktop-portal-gtk
    )
    "${pacman_command[@]}" -Syu --needed "${packages[@]}"
    install_yay
    yay -S --needed vicinae-bin
    printf 'Zen Browser and Handy are not installed; their shortcuts require manual installation.\n'
    printf 'On a fresh machine, enable NetworkManager and bluetooth services if needed.\n'
fi

for name in dunst hypr waybar; do
    link_path "$SCRIPT_DIR/.config/$name" "$HOME/.config/$name"
done

link_path \
    "$SCRIPT_DIR/.config/fcitx5/conf/classicui.conf" \
    "$HOME/.config/fcitx5/conf/classicui.conf"
link_path \
    "$SCRIPT_DIR/.local/share/fcitx5/themes/nordic" \
    "$HOME/.local/share/fcitx5/themes/nordic"

if [[ "$SKIP_SDDM" == false ]]; then
    install_sddm_theme
fi

printf 'Hyprland configuration installed. Reload or restart the desktop session.\n'
