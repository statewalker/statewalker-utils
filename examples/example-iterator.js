import iterate from "../src/iterate.js"

const maxDelay = 1000;
const N = 100;

const it = iterate(({ next, complete, error }) => { 
  let stop = false;
  (async () => {
    // Async process providing new values
    for (let i = 0; !stop && i < N; i++) {
       await new Promise(y => setTimeout(y, maxDelay * Math.random()));
      // Awaits when the provided value is consumed
      await next(`Hello - ${i}`)
    }
    await complete();
  })();
  // Finalizes iterations
  return () => stop = true;
})


// Async consumption of provided messages.
for await (let message of it) {
  console.log(message);
  await new Promise(y => setTimeout(y, maxDelay * Math.random()));
}