import type { Add } from "ts-arithmetic";
import type { IsEqual, Simplify } from "./types.ts";

/**
 * Get the props for a tuple variant from its args.
 */
type TupleProps<
  Arr extends unknown[],
  Props extends Record<string, unknown> = {},
  Index extends number = 0,
> = Simplify<
  Arr extends [infer _, ...infer Tail]
    ? TupleProps<Tail, Props & { readonly [I in Index as `$${I}`]: Arr[I] }, Add<Index, 1>>
    : Props
>;

/**
 * The constructor function for Case.Tuple instances.
 */
export interface TupleConstructor<Tag extends string> {
  new <A extends unknown[] = []>(...args: A): TupleProps<A> & { readonly tag: Tag };
}

/**
 * A utility class for defining the cases of a discriminated union
 * (a.k.a. algebraic data-type) containing tuple data which is accessible with instance.$<index>.
 *
 * @param tag The tag for the discriminated union
 * @returns A class constructor that creates a Variant instance.
 *
 * @example
 * import { Case } from "shield-ts";
 *
 * export class Ok<T> extends Case.Tuple("Ok")<[T]> {}
 * export class Err<T> extends Case.Tuple("Err")<[T]> {}
 *
 * export type Result<T, E> = Ok<T> | Err<T>;
 *
 * const value: Result<string, string> = new Ok('ok');
 * console.log(value.$0); // ok
 */
function Tuple<const Tag extends string>(tag: Tag): TupleConstructor<Tag> {
  abstract class TupleCase<const A extends unknown[]> {
    readonly tag = tag;

    protected constructor(...args: A) {
      // Since A is a tuple it's small so this is likely faster
      // than using a Proxy on this to read the values from the array.
      let i = args.length;
      while (i--) {
        (this as Record<string, unknown>)[`$${i}`] = args[i];
      }
    }
  }

  return TupleCase as TupleConstructor<Tag>;
}

export interface RecordConstructor<Tag extends string> {
  new <Args extends Record<string | symbol, unknown> = {}>(
    args: IsEqual<Args, {}> extends 1 ? void : Args,
  ): Args & { readonly tag: Tag };
}

/**
 * A class factory function that returns a class you can extend to create
 * the variants of a discriminated with a single symbol.
 * @param tag The discriminant tag for the union variant.
 */
export function Case<const Tag extends string>(tag: Tag): RecordConstructor<Tag> {
  abstract class RecordCase<A extends Record<string, unknown> = {}> {
    readonly tag = tag;

    protected constructor(args: IsEqual<A, {}> extends 1 ? void : A) {
      Object.assign(this, args);
    }
  }

  return RecordCase as RecordConstructor<Tag>;
}

/**
 * A utility class for defining the variants of a discriminated union
 * (a.k.a. algebraic data-type) containing tuple data which is accessible with ``instance[`$${index}`]``.
 *
 * @param tag The tag for the discriminated union
 * @returns A class constructor that creates a Variant instance.
 */
Case.Tuple = Tuple;
