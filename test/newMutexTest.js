import { default as expect } from 'expect.js';
import newMutex from '../src/newMutex.js';

describe('newMutex', function () {

  it('should call each method only once and avoid recursive calls', function () {
    const listeners = [];
    const mutex = newMutex();
    const notify = () => mutex(() => listeners.forEach(l => l()));
    
    const values = [];
    const N = 10;
    let counter = 0;
    for (let i = 0; i < N; i++) {
      values.push(0);
      listeners.push(() => { counter++; values[i]++; notify(); });
    }

    for (let i = 0; i < listeners.length; i++) {
      counter = 0;
      notify();
      expect(counter).to.be(N);
      for (let j = 0; j < N; j++) {
        expect(values[j]).to.be(i + 1);
      }
    }
    
  })


});