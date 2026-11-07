local current_slots = tonumber(redis.call('get', KEYS[1]))
if not current_slots then
    local init_slots = tonumber(ARGV[2])
    if not init_slots then
        return -1
    end
    redis.call('set', KEYS[1], init_slots)
    current_slots = init_slots
end
if current_slots > tonumber(ARGV[1]) then
    redis.call('decr', KEYS[1])
    return current_slots - 1
else
    return -2
end