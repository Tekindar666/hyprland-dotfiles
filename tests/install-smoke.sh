#!/usr/bin/env bash

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_HOME="$(mktemp -d)"
trap 'rm -rf "$TEST_HOME"' EXIT

bash -n "$REPO_DIR/install.sh"

HOME="$TEST_HOME" "$REPO_DIR/install.sh" --skip-sddm >/dev/null
HOME="$TEST_HOME" "$REPO_DIR/install.sh" --skip-sddm >/dev/null

for name in dunst hypr rofi waybar; do
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

printf 'Hyprland install smoke test passed\n'
