import iterate from "./iterate.js";
export default async function* observe(init) {
  let s, slot;
  const queue = {
    shift: () => (s = slot, slot = undefined, s),
    push: (s) => (slot && slot.notify && slot.notify(false), slot = s)
  };
  yield* iterate(({ next, complete, error }) => init(next, complete, error), queue);
}