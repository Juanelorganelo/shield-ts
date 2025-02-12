import type { Add } from "ts-arithmetic";
import type { IsEqual, Simplify } from "./types.ts";
import { startsWith } from "./utils.ts";

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
  abstract class Variant<A extends unknown[]> {
    readonly tag = tag;

    protected constructor(...args: A) {
      return new Proxy(this, {
        get(target, prop, receiver) {
          if (typeof prop === "string" && startsWith(prop, "$")) {
            const index = Number(prop.slice(1));
            if (Number.isNaN(index)) {
              return Reflect.get(target, prop, receiver);
            }
            return Reflect.get(target, index, args);
          }
          return Reflect.get(target, prop, receiver);
        },
        has(target, prop) {
          if (typeof prop === "string" && startsWith(prop, "$")) {
            const index = Number(prop.slice(1));
            if (Number.isNaN(index)) {
              return Reflect.has(target, prop);
            }
            return Reflect.has(args, index);
          }
          return Reflect.has(target, prop);
        },
      });
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
