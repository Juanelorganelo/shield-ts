import type {Add} from 'ts-arithmetic';

const tagSymbol = Symbol.for("@safezone/variant");

/**
 * A utility type that (ab)uses variance to check
 * if two types are exactly equal (as opposed to subtypes)
 */
type IsEqual<A, B> = [A] extends [B]
    ? [B] extends [A]
        ? 1
        : 0
    : 0;

type TupleProps<Arr extends unknown[], Props extends Record<string, unknown> = {}, Index extends number = 0> =
    Arr extends [infer _, ...infer Tail]
        ? TupleProps<Tail, Props & { readonly [I in Index as `$${I}`]: Arr[I] }, Add<Index, 1>>
        : Props;

/**
 * The constructor function for Variant.Tuple instances.
 */
interface TupleConstructor<Tag extends string> {
    new<A extends unknown[] = []>(...args: A): TupleProps<A> & { readonly tag: Tag }
}


/**
 * A utility class for defining the variants of a discriminated union (a.k.a. algebraic data-type)
 * containing tuple data which is accessible by a property instance.$<index>
 * @param tag The tag for the discriminated union
 * @returns A class constructor that creates a Variant instance.
 * @example
 *
 * import { Variant } from '@safezone/variant';
 *
 * // Variant of a single tuple.
 * class Ok<A> extends Variant.Tuple('Ok')<[A]> {}
 */
export function Tuple<const Tag extends string>(tag: Tag): TupleConstructor<Tag> {
    abstract class Variant<A extends unknown[]> {
        readonly tag = tag

        protected constructor(...args: A) {
            return new Proxy(this, {
                get(target, prop, receiver) {
                    if (typeof prop !== 'string' || !prop.startsWith('$')) return Reflect.get(target, prop, receiver);
                    else {
                        const index = Number(prop.slice(1, prop.length));
                        if (Number.isNaN(index)) return Reflect.get(target, prop, receiver);
                        else return Reflect.get(args, index, receiver);
                    }
                }
            })
        }
    }

    return Variant as TupleConstructor<Tag>;
}

export interface RecordConstructor<Tag extends string> {
    new<Args extends Record<string, unknown> = {}>(args: IsEqual<Args, {}> extends 1 ? void : Args):
        Args & { readonly tag: Tag }
}

export function Record<const Tag extends string>(tag: Tag): RecordConstructor<Tag> {
    abstract class Variant<A extends Record<string, unknown> = {}> {
        readonly tag = tag
        protected constructor(args: IsEqual<A, {}> extends 1 ? void : A) {
            Object.assign(this, args)
        }
    }
    return Variant as RecordConstructor<Tag>;
}
