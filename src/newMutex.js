export default function newMutex(reject = () => { }) {
  let lock = 0;
  return (action) => {
    if (lock) return reject(action, lock);
    lock++;
    try {
      return action();
    } finally {
      lock--;
    }
  };
}