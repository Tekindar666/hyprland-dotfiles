hl.config({
    general = {
        gaps_in = 3,
        gaps_out = { top = 4, right = 8, bottom = 8, left = 8 },
        border_size = 2,
        resize_on_border = true,
        layout = "dwindle",
        col = {
            active_border = "rgba(88c0d0ff)",
            inactive_border = "rgba(4c566aff)",
        },
    },
    decoration = {
        rounding = 6,
        shadow = {
            enabled = false,
        },
        blur = {
            enabled = false,
        },
    },
    misc = {
        disable_hyprland_logo = true,
        disable_splash_rendering = true,
        force_default_wallpaper = 0,
    },
    xwayland = {
        force_zero_scaling = true,
    },
})

hl.animation({
    leaf = "global",
    enabled = true,
    speed = 2, -- 200 ms; lower is faster.
    bezier = "default",
})
