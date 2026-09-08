local main_mod = "SUPER"
local hyper_mod = "SUPER + ALT + CTRL + SHIFT"

hl.bind(main_mod .. " + SHIFT + T", hl.dsp.exec_cmd("ghostty"))
hl.bind(main_mod .. " + SHIFT + B", hl.dsp.exec_cmd("zen-browser"))
hl.bind(main_mod .. " + SHIFT + E", hl.dsp.exec_cmd("dolphin"))
hl.bind(main_mod .. " + SPACE", hl.dsp.exec_cmd("pkill -x rofi || rofi -show drun"))

hl.bind(main_mod .. " + Q", hl.dsp.window.close())
hl.bind("ALT + F4", hl.dsp.window.close())
hl.bind(main_mod .. " + Y", hl.dsp.window.float({ action = "toggle" }))
hl.bind(hyper_mod .. " + F", hl.dsp.layout("colresize +conf"))
hl.bind("ALT + F", hl.dsp.window.fullscreen({ action = "toggle" }))

local directions = {
    { key = "H", direction = "left" },
    { key = "J", direction = "down" },
    { key = "K", direction = "up" },
    { key = "L", direction = "right" },
}

for _, binding in ipairs(directions) do
    hl.bind(hyper_mod .. " + " .. binding.key, hl.dsp.focus({ direction = binding.direction }))
    hl.bind("ALT + " .. binding.key, hl.dsp.window.swap({ direction = binding.direction }))
end

hl.bind(hyper_mod .. " + comma", hl.dsp.layout("move -col"))
hl.bind(hyper_mod .. " + period", hl.dsp.layout("move +col"))
hl.bind("ALT + SPACE", hl.dsp.layout("consume_or_expel prev"))

local workspaces = { "w", "t", "p", "a", "d", "x", "c", "b", "m" }

for _, name in ipairs(workspaces) do
    local key = string.upper(name)
    local workspace = "name:" .. name

    hl.bind(hyper_mod .. " + " .. key, hl.dsp.focus({ workspace = workspace }))
    hl.bind("ALT + " .. key, hl.dsp.window.move({ workspace = workspace, follow = true }))
end

hl.bind(main_mod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(main_mod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })
