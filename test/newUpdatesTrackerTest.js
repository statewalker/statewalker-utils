import { default as expect } from 'expect.js';
import newUpdatesTracker from '../src/newUpdatesTracker.js';

describe('newUpdatesTracker', function () {

  it('should notify all registered listeners', function () {
    let changes;
    const tracker = newUpdatesTracker()
      .enter((...args) => {
        const [s] = args;
        changes.push(["enter", ...args]);
        return s.toUpperCase();
      })
      .exit((...args) => {
        changes.push(["exit", ...args]);
      })
      .update((...args) => {
        changes.push(["update", ...args]);
      });

    changes = [];
    let result = tracker(["a", "b", "c"]);
    expect(result).to.eql(["A", "B", "C"]);
    expect(changes).to.eql([
      ['enter', 'a', 'a', 0],
      ['enter', 'b', 'b', 1],
      ['enter', 'c', 'c', 2]
    ]);


    changes = [];
    result = tracker(["a", "c", "d"]);
    expect(result).to.eql(["A", "C", "D"]);
    expect(changes).to.eql([
      ['update', 'A', 'a', 'a', 0],
      ['update', 'C', 'c', 'c', 1],
      ['enter', 'd', 'd', 2],
      ['exit', 'B', 'b', 'b', 1]
    ]);

    changes = [];
    result = tracker(["d", "c", "a"]);
    expect(result).to.eql(["D", "C", "A"]);
    expect(changes).to.eql([
      ['update', 'D', 'd', 'd', 0],
      ['update', 'C', 'c', 'c', 1],
      ['update', 'A', 'a', 'a', 2]
    ]);

    changes = [];
    result = tracker(["x", "d", "a"]);
    expect(result).to.eql(["X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', 'x', 'x', 0],
      ['update', 'D', 'd', 'd', 1],
      ['update', 'A', 'a', 'a', 2],
      ['exit', 'C', 'c', 'c', 1]
    ]);

    changes = [];
    result = tracker(["y", "x", "d", "a"]);
    expect(result).to.eql(["Y", "X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', 'y', 'y', 0],
      ['update', 'X', 'x', 'x', 1],
      ['update', 'D', 'd', 'd', 2],
      ['update', 'A', 'a', 'a', 3]
    ]);
  })

});