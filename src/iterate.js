// See https://github.com/agenjs/agen-utils/blob/main/src/iterator.js
export default async function* iterate(init, queue = []) {
  let promise, notify, push = async (error, value, done) => {
    const slot = { error, value, done };
    slot.promise = new Promise(n => slot.notify = n);
    await queue.push(slot);
    notify && notify();
    notify = null;
    return slot.promise;
  }
  const next = (value) => push(undefined, value, false);
  const complete = () => push(undefined, undefined, true);
  const error = err => push(err, undefined, true);
  const unsubscribe = init(Object.assign([next, complete, error], { next, complete, error }));
  let slot;
  try {
    while (true) {
      slot = await queue.shift();
      if (slot) {
        try {
          if (slot.error) { throw slot.error; }
          else if (slot.done) { break; }
          else { yield slot.value; }
        } finally {
          slot.notify(true);
        }
      } else {
        await (promise = notify ? promise : new Promise(n => notify = n));
      }
    }
  } finally {
    notify && notify();
    push = () => false; // Stop pushing in the queue...
    ((typeof unsubscribe === 'function') && (await unsubscribe()));
    while (slot = await queue.shift()) { slot.notify(false); }
  }
}