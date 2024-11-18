/**
 * Call f() only if it hasn't been called since X ms 
 */
export default function throttle(f: any, timeoutMS: number) {
  let lastcall: number;
  return (...args) => {
    // not yet called || called a while ago
    if (!lastcall || lastcall + timeoutMS < performance.now()) {
      lastcall = performance.now()
      f(...args)
    }
  }
}