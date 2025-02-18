/**
 * When writing web applications it's very common to access data from a database and end up
 * with a type that's similar to this.
 * ```ts
 * interface User {
 *   id: number;
 *   email: string;
 * }
 * 
 * interface Course {
 *   id: number
 *   name: string;
 * }
 * ```
 * The problem with this is that we can accidentaly mix up course and user id's.
 * To solve this problem we export an `Id<P, U>` type that distinguishes your id's at compile time
 * to avoid bugs.
 * 
 * import { type Id } from 'shield-ts';
 * 
 * @example
 * interface User { id: Id<User>, email: string }
 * interface Course { id: Id<Course>, name: string }
 */
export type Id<_P, U extends string | number = number> = U & { readonly _: unique symbol };
export function id<P, U extends string | number = number>(value: U): Id<P, U> {
  return value as Id<P, U>
}
