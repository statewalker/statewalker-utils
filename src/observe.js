import iterate from "./iterate.js";
export default async function* observe(init, newQueue) {
  yield* iterate(({ notify }) => init(notify), newQueue);
}