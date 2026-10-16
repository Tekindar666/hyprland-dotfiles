hl.monitor({
    output = "DP-3",
    mode = "3840x2160@165.06Hz",
    position = "0x0",
    scale = "1.5",
})

hl.workspace_rule({
    workspace = "name:w",
    monitor = "DP-3",
    default = true,
})
