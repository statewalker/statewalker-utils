import { default as expect } from 'expect.js';
import observe from '../src/observe.js';

describe("observe", () => {

  // See https://github.com/observablehq/stdlib/blob/main/src/generators/observe.mjs
  // function observe(initialize) {
  //   let stale = false;
  //   let value;
  //   let resolve;
  //   const dispose = initialize(change);
  
  //   if (dispose != null && typeof dispose !== "function") {
  //     throw new Error(typeof dispose.then === "function"
  //         ? "async initializers are not supported"
  //         : "initializer returned something, but not a dispose function");
  //   }
  
  //   function change(x) {
  //     if (resolve) resolve(x), resolve = null;
  //     else stale = true;
  //     return value = x;
  //   }
  
  //   function next() {
  //     return {done: false, value: stale
  //         ? (stale = false, Promise.resolve(value))
  //         : new Promise(_ => (resolve = _))};
  //   }
  
  //   return {
  //     [Symbol.iterator]: function() { return this; },
  //     throw: () => ({done: true}),
  //     return: () => (dispose != null && dispose(), {done: true}),
  //     next
  //   };
  // }
  
  
  it(`should provide async values to iterate`, async () => {
    const control = ['a', 'b', 'c', 'd', 'e']
    let finished = false;
    let done = false;
    const it = observe((next) => {
      (async () => {
        for (let value of control) {
          if (done) break;
          next(value);
          await new Promise(y => setTimeout(y, 10 * Math.random()));
        }
        finished = true;
      })();
      
      return () => done = true;
    })

    const list = [];

    expect(done).to.be(false);
    for await (let value of it) {
      list.push(value);
      if (finished) break ;
      if (list.length === control.length) break;
    }
    expect(list).to.eql(control);
    expect(done).to.be(true);
  })


  it(`should be able to await values consumption`, async () => {
    const control = ['a', 'b', 'c', 'd', 'e']
    let finished = false;
    let done = false;
    const it = observe((next) => {
      (async () => {
        for (let i = 0; i < control.length; i++) {
          finished = i === control.length - 1;
          await next(control[i]);
        }        
      })();
      return () => done = true;
    })

    const list = [];

    expect(done).to.be(false);
    for await (let value of it) {
      await new Promise(y => setTimeout(y, 10 * Math.random()));
      list.push(value);
      if (finished) break ;
    }
    expect(list).to.eql(control);
    expect(done).to.be(true);
  })

  it(`should drop all non-consumed values (to avoid back-pressure)`, async () => {
    const control = ['a', 'b', 'c', 'd', 'e']
    let finished = false;
    let done = false;
    const it = observe((next) => {
      (async () => {
        for (let i = 0; i < control.length; i++) {
          finished = i === control.length - 1;
          next(control[i]);
        }
      })();
      return () => done = true;
    })

    const list = [];

    expect(done).to.be(false);
    for await (let value of it) {
      list.push(value);
      if (finished) break ;
    }
    expect(list).to.eql([control[control.length - 1]]);
    expect(done).to.be(true);
  })


  
})
