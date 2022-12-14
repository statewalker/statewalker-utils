import { default as expect } from 'expect.js';
import iterate from '../src/iterate.js';

describe("iterate", () => {

  it(`iterate(o) [without callbacks] should iterate over non-synchronized values`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let iterator = iterate(o => { 
        for (let str of strings) {
          o.next(str);
        }
        o.complete();
      })
      let list = [];
      for await (let str of iterator) {
        list.push(str);
      }
      expect(list).to.eql(control);
    }
  })
  
  it(`iterate(o) [without callbacks]  - should iterate over async values without waiting for consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
      }
      expect(list).to.eql(control);
    }
  })
  
  it(`iterate(o) [without callbacks]  - should iterate wity async provider and async consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
        await new Promise(r => setTimeout(r, Math.random() * 10));
      }
      expect(list).to.eql(control);
    }
  })
  
  it(`iterate(o) [without callbacks]  - should iterate with syncrhonization between provider and consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
        await new Promise(r => setTimeout(r, Math.random() * 10));
      }
      expect(list).to.eql(control);
    }
  })
  
  
  it(`iterate(o) [wit callbacks] should iterate over non-synchronized values`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let notified = false;
      let iterator = iterate(o => {
        for (let str of strings) {
          o.next(str);
        }
        o.complete();
        return () => notified = true;
      })
      let list = [];
      for await (let str of iterator) {
        list.push(str);
      }
      expect(list).to.eql(control);
      expect(notified).to.be(true);
    }
  })
  
  it(`should iterate over async values without waiting for consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let notified = false;
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => notified = true;
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
      }
      expect(list).to.eql(control);
      expect(notified).to.be(true);
    }
  })
  
  it(`should iterate wity async provider and async consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let notified = false;
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => notified = true;
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
        await new Promise(r => setTimeout(r, Math.random() * 10));
      }
      expect(list).to.eql(control);
      expect(notified).to.be(true);
    }
  })
  
  it(`should iterate with syncrhonization between provider and consumer`, async () => {
    await test([], []);
    await test([''], ['']);
    await test(['a'], ['a']);
    await test(['a', 'b', 'c'], ['a', 'b', 'c']);
    await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
    async function test(strings, control) {
      let notified = false;
      let iterator = iterate(o => {
        (async () => {
          for (let str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise(r => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
        return () => notified = true;
      })
  
      let list = [];
      for await (let str of iterator) {
        list.push(str);
        await new Promise(r => setTimeout(r, Math.random() * 10));
      }
      expect(list).to.eql(control);
      expect(notified).to.be(true);
    }
  })
})
