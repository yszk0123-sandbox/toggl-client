type R<T, Key extends keyof T> = Exclude<T, Key> & Required<Pick<T, Key>>;
function r<T, K extends keyof T>(t: T, k: K): t is R<T, K> {
  return t[k] != null;
}
export function rr<T, K extends keyof T>(k: K) {
  return (t: T): t is R<T, K> => r(t, k);
}
