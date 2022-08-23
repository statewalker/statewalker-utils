import { default as expect } from 'expect.js';
import newRegistry from '../src/newRegistry.js';

describe('newRegistry', function () {

  it('should call all registered functions only unce', function () {
    const [register, cleanup] = newRegistry();
    let counter = 0;
    register(() => counter++);
    register(() => counter++);
    expect(counter).to.be(0);
    cleanup();
    expect(counter).to.be(2);
    cleanup();
    expect(counter).to.be(2);
  })

  it('should remove unregistered functions from the cleanup list', function () {
    const [register, cleanup, unregister] = newRegistry();
    let first = 0;
    const one = () => first++;
    register(one);

    let second = 0;
    const two = () => second++;
    register(two);

    expect(first).to.be(0);
    expect(second).to.be(0);
    unregister(one);

    expect(first).to.be(0);
    expect(second).to.be(0);

    cleanup();
    expect(first).to.be(0);
    expect(second).to.be(1);
  })

  it('should remove registered functions from the list', function () {
    const [register, cleanup] = newRegistry();
    let first = 0;
    const one = register(() => first++);

    let second = 0;
    const two = register(() => second++);

    one();
    expect(first).to.be(1);
    expect(second).to.be(0);

    two();
    expect(first).to.be(1);
    expect(second).to.be(1);

    cleanup();
    expect(first).to.be(1);
    expect(second).to.be(1);
  })


});