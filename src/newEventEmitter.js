export default function newEventEmitter(events = {}) {
  const index = (events.listeners = {});
  events.on = function on(event, listener) {
    (index[event] = index[event] || []).push(listener);
    return () => events.off(event, listener);
  };
  events.off = function off(event, listener) {
    index[event] = (index[event] || []).filter((l) => l !== listener);
  };
  events.emit = function emit(event, ...args) {
    for (const l of index[event] || []) {
      l(...args);
    }
  };
  return events;
}