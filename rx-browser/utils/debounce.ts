export default function debounce(f: any, timeoutMS: number) {
  let lastcall: number;
  return (...args) => {
    // not yet called || called a while ago
    if (!lastcall || lastcall + timeoutMS < performance.now()) {
      lastcall = performance.now()
      window.setTimeout(() => f(...args), timeoutMS);
    }
  }
}