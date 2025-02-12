import type { Add } from "ts-arithmetic";
import type { IsEqual, Simplify } from "./types.ts";

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
 * The constructor function for Variant.Tuple instances.
 */
interface TupleConstructor<Tag extends string> {
  new <A extends unknown[] = []>(...args: A): TupleProps<A> & { readonly tag: Tag };
}

/**
 * A utility class for defining the variants of a discriminated union
 * (a.k.a. algebraic data-type) containing tuple data which is accessible with instance.$<index>.
 * 
 * @param tag The tag for the discriminated union
 * @returns A class constructor that creates a Variant instance.
 */
export function Tuple<const Tag extends string>(tag: Tag): TupleConstructor<Tag> {
  abstract class Variant<const A extends unknown[]> {
    readonly tag = tag;

    protected constructor(...args: A) {
      // Since A is a tuple it's small so this is likely faster
      // than using a Proxy on this to read the values from the array.
      let i = args.length;
      while (--i) {
        (this as Record<string, unknown>)[`$${i}`] = args[i];
      }
    }
  }

  return Variant as TupleConstructor<Tag>;
}

export interface RecordConstructor<Tag extends string> {
  new <Args extends Record<string, unknown> = {}>(
    args: IsEqual<Args, {}> extends 1 ? void : Args,
  ): Args & { readonly tag: Tag };
}

export function Record<const Tag extends string>(tag: Tag): RecordConstructor<Tag> {
  abstract class Variant<A extends Record<string, unknown> = {}> {
    readonly tag = tag;

    protected constructor(args: IsEqual<A, {}> extends 1 ? void : A) {
      Object.assign(this, args);
    }
  }

  return Variant as RecordConstructor<Tag>;
}
