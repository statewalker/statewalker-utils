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
      ['update', 'A', 'a', 'a', 'a', 0],
      ['update', 'C', 'c', 'c', 'c', 1],
      ['enter', 'd', 'd', 2],
      ['exit', 'B', 'b', 'b', 1]
    ]);

    changes = [];
    result = tracker(["d", "c", "a"]);
    expect(result).to.eql(["D", "C", "A"]);
    expect(changes).to.eql([
      ['update', 'D', 'd', 'd', 'd', 0],
      ['update', 'C', 'c', 'c', 'c', 1],
      ['update', 'A', 'a', 'a', 'a', 2]
    ]);

    changes = [];
    result = tracker(["x", "d", "a"]);
    expect(result).to.eql(["X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', 'x', 'x', 0],
      ['update', 'D', 'd', 'd', 'd', 1],
      ['update', 'A', 'a', 'a', 'a', 2],
      ['exit', 'C', 'c', 'c', 1]
    ]);

    changes = [];
    result = tracker(["y", "x", "d", "a"]);
    expect(result).to.eql(["Y", "X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', 'y', 'y', 0],
      ['update', 'X', 'x', 'x', 'x', 1],
      ['update', 'D', 'd', 'd', 'd', 2],
      ['update', 'A', 'a', 'a', 'a', 3]
    ]);
  })


  it('should update object all registered listeners', function () {
    let changes;
    const tracker = newUpdatesTracker()
      .key(d => d.key)
      .enter((...args) => {
        const [s] = args;
        changes.push(["enter", ...args]);
        return s.label;
      })
      .exit((...args) => {
        changes.push(["exit", ...args]);
      })
      .update((...args) => {
        changes.push(["update", ...args]);
      });

    changes = [];
    let result = tracker([
      { key : "a", label : 'A', id : 1 } ,
      { key : "b", label : 'B', id : 2 }, 
      { key : "c", label : 'C', id : 3 }
    ]);
    expect(result).to.eql(["A", "B", "C"]);
    expect(changes).to.eql([
      ['enter', { key : "a", label : 'A', id : 1 } , 'a', 0],
      ['enter', { key : "b", label : 'B', id : 2 } , 'b', 1],
      ['enter', { key : "c", label : 'C', id : 3 } , 'c', 2]
    ]);

    changes = [];
    result = tracker([
      { key : "a", label : 'A', id : 4 } ,
      { key : "c", label : 'C', id : 5 }, 
      { key : "d", label : 'D', id : 6 }
    ]);
    expect(result).to.eql(["A", "C", "D"]);
    expect(changes).to.eql([
      ['update', 'A', { key : "a", label : 'A', id : 4 }, { key : "a", label : 'A', id : 1 }, 'a', 0],
      ['update', 'C', { key : "c", label : 'C', id : 5 }, { key : "c", label : 'C', id : 3 }, 'c', 1],
      ['enter', { key : "d", label : 'D', id : 6 }, 'd', 2],
      ['exit', 'B', { key : "b", label : 'B', id : 2 }, 'b', 1]
    ]);


    changes = [];
    result = tracker([
      { key : "d", label : 'D', id : 7 },
      { key : "c", label : 'C', id : 8 }, 
      { key : "a", label : 'A', id : 9 } ,
    ]);
    expect(result).to.eql(["D", "C", "A"]);
    expect(changes).to.eql([
      ['update', 'D', { key : "d", label : 'D', id : 7 }, { key : "d", label : 'D', id : 6 }, 'd', 0],
      ['update', 'C', { key : "c", label : 'C', id : 8 }, { key : "c", label : 'C', id : 5 }, 'c', 1],
      ['update', 'A', { key : "a", label : 'A', id : 9 }, { key : "a", label : 'A', id : 4 }, 'a', 2],
    ]);

    changes = [];
    result = tracker([
      { key : "x", label : 'X', id : 10 },
      { key : "d", label : 'D', id : 11 }, 
      { key : "a", label : 'A', id : 12 } ,
    ]);
    expect(result).to.eql(["X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', { key : "x", label : 'X', id : 10 }, 'x', 0],
      ['update', 'D', { key : "d", label : 'D', id : 11 }, { key : "d", label : 'D', id : 7 }, 'd', 1],
      ['update', 'A', { key : "a", label : 'A', id : 12 }, { key : "a", label : 'A', id : 9 }, 'a', 2],
      ['exit', 'C', { key : "c", label : 'C', id : 8 }, 'c', 1]
    ]);

    changes = [];
    result = tracker([
      { key : "y", label : 'Y', id : 13 },
      { key : "x", label : 'X', id : 14 },
      { key : "d", label : 'D', id : 15 }, 
      { key : "a", label : 'A', id : 16 } ,
    ]);
    expect(result).to.eql(["Y", "X", "D", "A"]);
    expect(changes).to.eql([
      ['enter', { key : "y", label : 'Y', id : 13 }, 'y', 0],
      ['update', 'X', { key : "x", label : 'X', id : 14 }, { key : "x", label : 'X', id : 10 }, 'x', 1],
      ['update', 'D', { key : "d", label : 'D', id : 15 }, { key : "d", label : 'D', id : 11 }, 'd', 2],
      ['update', 'A', { key : "a", label : 'A', id : 16 }, { key : "a", label : 'A', id : 12 }, 'a', 3],
    ]);
  })

});