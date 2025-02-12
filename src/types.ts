/**
 * Simplifies type definitions
 */
export type Simplify<A> = {
  [K in keyof A]: A[K];
} extends infer B
  ? B
  : never;

/**
 * A utility type that (ab)uses variance to check
 * if two types are exactly equal (as opposed to subtypes)
 */
export type IsEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? 1 : 0) : 0;

/**
 * A utility type that transforms A | B into A & B
 */
export type UnionToIntersection<T> = (
  T extends any ? (x: T) => any : never
) extends (x: infer R) => any
  ? R
  : never;
