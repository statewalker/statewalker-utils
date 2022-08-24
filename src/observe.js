import iterate from "./iterate.js";
export default async function* observe(init) {
  const newQueue = () => {
    let slot;
    return {
      shift : () => {
        let s = slot;
        slot = undefined;
        return s;
      },
      push : (s) => {
        if (slot && slot.notify) slot.notify(false);
        slot = s;
      }
    }
  }
  yield* iterate(({ next }) => init(next), newQueue);
}