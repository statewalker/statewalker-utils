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


## newUpdatesTracker()

This method returns a function allowing to tracks data modifications.

Callback methods used to notify about new elements (`onEnter`), about removed data values (`onExit`)
and about updated elements (`onUpdate`):
```javascript

  // This method is called to notify about new elements in the data array.
  // @params
  // * value - the data value
  // * key - the key of the data element; if the `getKey` function is not defined then it is the data object itself
  // * index - index (position) of this data element in the list
  // @return: an newly created object associated with the given data value
  const onEnter = (value, key, index) => { ... return { value } }

  // Callback method to call when a data was removed from the data list.
  // @params
  // * object - the object corresponding to the data
  // * value - the data value
  // * key - the key of the data element; if the `getKey` function is not defined then it is the data object itself
  // * index - index (position) of this data element in the previous list, before removal
  // @return: undefined; this method should return nothing 
  const onExit = (object, value, key, index) => { ... }

  // Callback method to call when a data was updated.
  // @params
  // * object - previously returned object corresponding to the data with the same key
  // * value - the data value in the list
  // * prevValue - previous data value corresponding to the same key
  // * key - the key of the data element; if the `getKey` function is not defined then it is the data object itself
  // * index - index (position) of this data element in the list
  // * prevIndex - previous index (position) of this data element in the list
  // @return: an object associated with the updated data value; if this method returns nothing 
  // then the previous object is used
  const onUpdate = (
    object,
    value, prevValue,
    key,
    index, prevIndex
  ) => { ... return { value } }

```

To get the unique identity of each data values the `getKey` method used:
```javascript

  // This method is used to detect the unique identifier of the object. If this method is not defined
  // the the object itself is used as the key.
  // @params
  // * value - the data value in the data list
  // * index - index (position) of the value in the list
  const getKey = (value, index) => { return value; }
```

Update tracker initialization:
```javascript

  // Creates a new tracker object
  let tracker = newUpdatesTracker({ onEnter, onExit, onUpdate, getKey });

  // Alternatively, the same configuration can be done like that:
  tracker = newUpdatesTracker()
    .key(getKey)
    .update(onUpdate)
    .exit(onExit)
    .enter(onEnter);

```

Example of usage of these methods:
```javascript

  const container = document.body;

  // Creates a new tracker object
  let tracker = newUpdatesTracker()
    .key((d) => d.id)
    .enter((d, key, idx) => {
      const div = document.createElement("div");
      container.appendChild(div);
      div.innerText = d.content;
      return div;
    })
    .update((div, d, oldD, key, idx, prevIdx) => {
      div.innerText = d.content;
      container.appendChild(div); // Move the element to the new position
      return div;
    })
    .exit((div, d, key, idx) => {
      div.parentElement.removeChild(div);
    });
  
  // Set the initial values:
  tracker([
    { id : 1, content : "Hello" },
    { id : 2, content : "Wonderful" },
    { id : 3, content : "World" },
  ]);


  // Update data:
  tracker([
    { id : 1, content : "Hello" },
    { id : 2, content : "Beautiful" }, // Only this value is updated
    { id : 3, content : "World" },
  ]);

  // The second data update:
  // - id=0: insert a new line ("New information")
  // - id=1: no changes ("Hello")
  // - id=2: diseapears ("Beautiful")
  // - id=5: insert ("John")
  // - id=3: updated ("World" => "Smith")
  tracker([
    { id : 0, content : "New information" },
    { id : 1, content : "Hello" },
    { id : 5, content : "John" },
    { id : 3, content : "Smith" },
  ]);

```