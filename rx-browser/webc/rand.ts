export function RandName(): string {
  const ary = new Uint32Array(2);
  crypto.getRandomValues(ary);
  let buf: number[] = [];
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 8; i++) {
      buf.push((97 + ary[j]) & 15);
      ary[j] = ary[j] >>> 4;
    }
  }

  return String.fromCodePoint(...buf);
}
