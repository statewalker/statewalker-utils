import { default as expect } from 'expect.js';
import newEventEmitter from '../src/newEventEmitter.js';

describe('newEventEmitter', function () {

  it('should notify all registered listeners', function () {
    const emitter = newEventEmitter();
    let counter = 0;
    emitter.on("a", () => counter++);
    emitter.on("a", () => counter++);
    emitter.emit("a");
    expect(counter).to.be(2);
  })

  it('should be able to unregister listeners', function () {
    const emitter = newEventEmitter();
    let counter = 0;
    const firstListener = () => counter++;
    emitter.on("a", firstListener);
    emitter.on("a", () => counter++);
    emitter.off("a", firstListener);
    emitter.emit("a");
    expect(counter).to.be(1);
  })

  it('should be able to unregister listeners by the returned function', function () {
    const emitter = newEventEmitter();
    let counter = 0;
    const unreg = emitter.on("a", () => counter++);
    emitter.on("a", () => counter++);
    unreg();
    emitter.emit("a");
    expect(counter).to.be(1);
  })

});