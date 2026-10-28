#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_HOME="$(mktemp -d)"
trap 'rm -rf "$TEST_HOME"' EXIT

bash -n "$REPO_DIR/install.sh"

HOME="$TEST_HOME" "$REPO_DIR/install.sh" --skip-sddm >/dev/null
HOME="$TEST_HOME" "$REPO_DIR/install.sh" --skip-sddm >/dev/null

if [[ -e "$TEST_HOME/.config/rofi" || -L "$TEST_HOME/.config/rofi" ]]; then
    printf 'Fresh installs must not link the legacy Rofi configuration\n' >&2
    exit 1
fi

for name in dunst hypr waybar; do
    source="$REPO_DIR/.config/$name"
    target="$TEST_HOME/.config/$name"

    if [[ ! -L "$target" || "$(readlink "$target")" != "$source" ]]; then
        printf 'Invalid config link: %s\n' "$target" >&2
        exit 1
    fi
done

while read -r source target; do
    expected="$REPO_DIR/$source"
    actual="$TEST_HOME/$target"

    if [[ ! -L "$actual" || "$(readlink "$actual")" != "$expected" ]]; then
        printf 'Invalid Fcitx5 link: %s\n' "$actual" >&2
        exit 1
    fi
done <<'LINKS'
.config/fcitx5/conf/classicui.conf .config/fcitx5/conf/classicui.conf
.local/share/fcitx5/themes/nordic .local/share/fcitx5/themes/nordic
LINKS

if find "$TEST_HOME" -name '*.backup.*' -print -quit | grep -q .; then
    printf 'Second install created unexpected backups\n' >&2
    exit 1
fi

mkdir -p "$TEST_HOME/bin"
cat >"$TEST_HOME/bin/pacman" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >"$HOME/pacman-args"
MOCK
cat >"$TEST_HOME/bin/sudo" <<'MOCK'
#!/usr/bin/env bash
exec "$@"
MOCK
cat >"$TEST_HOME/bin/yay" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >"$HOME/yay-args"
MOCK
chmod +x "$TEST_HOME/bin/pacman" "$TEST_HOME/bin/sudo" "$TEST_HOME/bin/yay"

HOME="$TEST_HOME" PATH="$TEST_HOME/bin:$PATH" \
    "$REPO_DIR/install.sh" --skip-sddm --install-packages >/dev/null
if [[ "$(<"$TEST_HOME/pacman-args")" != '-Syu --needed base-devel git hyprland hyprpaper dunst waybar networkmanager network-manager-applet blueman bluez bluez-utils wl-clipboard fcitx5 fcitx5-chinese-addons fcitx5-configtool polkit-gnome ghostty nautilus ttf-jetbrains-mono-nerd python ddcutil brightnessctl pipewire pipewire-audio pipewire-pulse wireplumber xdg-desktop-portal-hyprland xdg-desktop-portal-gtk' ]]; then
    printf 'Unexpected desktop package installation command\n' >&2
    exit 1
fi

if [[ "$(<"$TEST_HOME/yay-args")" != '-S --needed vicinae-bin' ]]; then
    printf 'Unexpected Vicinae installation command\n' >&2
    exit 1
fi

# Simulate a fresh machine without yay, without fetching or installing anything.
mv "$TEST_HOME/bin/yay" "$TEST_HOME/yay-mock"
mkdir "$TEST_HOME/tools"
for tool in bash dirname mkdir ln mktemp rm cp; do
    ln -s "$(command -v "$tool")" "$TEST_HOME/tools/$tool"
done
cat >"$TEST_HOME/bin/git" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
[[ "$1" == clone && "$2" == https://aur.archlinux.org/yay-bin.git ]]
printf '%s\n' "$3" >"$HOME/yay-build-path"
mkdir -p "$3"
MOCK
cat >"$TEST_HOME/bin/makepkg" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
[[ "$*" == '-si' && "$PWD" == "$(<"$HOME/yay-build-path")" ]]
cp "$HOME/yay-mock" "$HOME/bin/yay"
MOCK
chmod +x "$TEST_HOME/bin/git" "$TEST_HOME/bin/makepkg"
rm "$TEST_HOME/yay-args"
HOME="$TEST_HOME" PATH="$TEST_HOME/bin:$TEST_HOME/tools" \
    "$REPO_DIR/install.sh" --skip-sddm --install-packages >/dev/null
if [[ "$(<"$TEST_HOME/yay-args")" != '-S --needed vicinae-bin' || -d "$(<"$TEST_HOME/yay-build-path")" ]]; then
    printf 'Yay bootstrap failed or left its build directory behind\n' >&2
    exit 1
fi

if [[ ! -f "$TEST_HOME/.config/hypr/assets/wallpaper.png" ]]; then
    printf 'Wallpaper asset is missing\n' >&2
    exit 1
fi

printf 'Hyprland install smoke test passed\n'
