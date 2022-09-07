export default function newUpdatesTracker({
  onEnter = (v) => v,
  onExit = (v) => v,
  onUpdate = (v) => v,
  getKey = (v) => v
} = {}) {
  let index = new Map();
  function f(values = []) {
    const newIndex = new Map();
    const list = [];
    for (let value of values) {
      const key = getKey(value);
      let slot = index.get(key);
      const idx = list.length;
      let item = slot
        ? onUpdate(slot[0], value, slot[1], key, idx)
        : onEnter(value, key, idx);
      if (item === undefined && slot) item = slot[0];
      slot = [item, value, idx];
      index.delete(key);
      newIndex.set(key, slot);
      list.push(slot[0]);
    }
    for (const [key, slot] of index.entries()) {
      onExit(slot[0], slot[1], key, slot[2]);
    }
    index = newIndex;
    return list;
  }
  f.enter = function (v) {
    return arguments.length === 0 ? onEnter : ((onEnter = v), f);
  };
  f.exit = function (v) {
    return arguments.length === 0 ? onExit : ((onExit = v), f);
  };
  f.update = function (v) {
    return arguments.length === 0 ? onUpdate : ((onUpdate = v), f);
  };
  f.key = function (v) {
    return arguments.length === 0 ? getKey : ((getKey = v), f);
  };
  return f.enter(onEnter).exit(onExit).update(onUpdate).key(getKey);
}