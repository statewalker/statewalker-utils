# @statewalker/utils: Common Utility Methods and Classes

This package contains the following classes and methods used in other packages:
* newEventEmitter - basic event emitter with three methods: "on", "off", "emit"
* newMutex - mutual exclusion function; used to avoid infinite recursive calls
* newRegestry - registers methods to call at once; very useful when it is required to cleanup resources

## newEventEmitter()

```javascript
  const emitter = newEventEmitter();

  // Register a handler
  const handler = (ev) => console.log(handler);
  const unreg = emitter.on("hello", handler);

  // This method will print "Hello World!" on console
  emitter.emit("hello", "Hello World!");
  
  // Removes the listener registration:
  unreg();
  // OR: emitter.off("hello", handler);

  // Print nothing - there is no more listeners 
  emitter.emit("hello", "Hello World!");

```

## newMutex()

This method is used to return a mutex function allowing to avoid infinite loops.

```javascript
  // Each store give access to underlying data.
  // When the
  function newStore(value) {
    const events = newEventEmitter();
    return {
      get: () => value,
      set: (v) => {
        value = v;
        events.emit("update", value);
      },
      subscribe: (listener) => (events.on("update", listener), listener(value))
    };
  }
  // This method synchronizes values managed by stores
  function sync(...stores) {
    const [register, cleanup] = newRegistry();
    const mutex = newMutex();
    const notify = (value) =>
      mutex(() => stores.forEach((store) => store.set(value)));
    mutex(() => stores.forEach((store) => register(store.subscribe(notify))));
    return cleanup;
  }

  const storeOne = newStore();
  const storeTwo = newStore();
  const storeThree = newStore();

  // List of all stores
  const stores = [storeOne, storeTwo, storeThree];
  // Synchronize stores
  sync(...stores);

  storeThree.set("ABC");
  // At this stage all stores return the "ABC"


  storeOne.set("CDE");
  // All store values are "CDE";

```

## newRegistry()

This method allows to register multiple callbacks and call all of them later.


```javascript
  const [register, cleanup, unregister] = newRegistry();
  register(() => console.log('One'));
  const unreg = register(() => console.log('Two'));
  register(() => console.log('Three'));

// This method removes the specified actions to call
  unreg();
  
// At this stage console will print the following messages:
// - "One"
// - "Three"
  cleanup();

```

## iterate(init)

This method allows to define an async iterator using the following method provided in the activation callback:
- next - returns the next value
- complete - notifies about a successful completion of the iteration process
- error - finalizes iterations with an error

```javascript
// In this example the provider and consumer are synchronized between them:
// the provider sends a new value only after the previous one was sucecssfully consumed.
// This iterator allows also to terminate the iteration by both sides - by consumer
// as well as by provider.
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
```