import type {UnionToIntersection} from "./types.ts";

const brandTypeId = Symbol.for('brandTypeId')

type AnyBrand = Brand<string>;

export interface Brand<in out Tag extends string | symbol> {
    readonly [brandTypeId]: {
        readonly [K in Tag]: Tag;
    }
}

export type Brands<P> = P extends Brand<string> ? UnionToIntersection<
        {
            [k in keyof P[typeof brandTypeId]]: k extends string | symbol ? Brand<k>
            : never
        }[keyof P[typeof brandTypeId]]
    >
    : never

export type Unbranded<A extends AnyBrand> = A extends (infer U & Brands<A>) ? U : never;

export interface NominalBrandConstructor<A extends AnyBrand> {
    (value: Unbranded<A>): A;
}

export interface RefinedBrandConstructor<A extends AnyBrand> {
    (value: Unbranded<A>): A | never;

    orNull(value: Unbranded<A>): A | null;
}

export class BrandedTypeError extends Error {
}

export function nominal<A extends AnyBrand>(): NominalBrandConstructor<A> {
    return <A extends AnyBrand>(value: Unbranded<A>): A => value as A;
}

export function refined<A extends AnyBrand>(validate: (value: Unbranded<A>) => null | string): RefinedBrandConstructor<A> {
    function ctor(value: Unbranded<A>): A | never {
        const message = validate(value);
        if (message) {
            throw new BrandedTypeError(`unsafeCtor value: ${message}`);
        }
        return value as A;
    }

    function orNull(value: Unbranded<A>): A | null {
        const message = validate(value);
        if (message) {
            return null;
        }
        return value as A;
    }

    (ctor as RefinedBrandConstructor<A>).orNull = orNull;
    return ctor as RefinedBrandConstructor<A>;
}