import {
    type BrandOf,
    type RefinedBrandConstructor,
    type TransparentBrandConstructor,
    type Unbranded,
} from "./brand.ts";
import { Case } from "./union.ts";

// Should be Validation
class Ok<A> extends Case.Tuple("Ok")<[A]> {}
class Err<E> extends Case.Tuple("Err")<[E]> {}
type Result<A, E> = Ok<A> | Err<E>;

class DecodeError extends Error {
    constructor(readonly path: string[], readonly error: string, options?: ErrorOptions) {
        super(error, options);
    }
}

class EncodeError extends Error {
    constructor(readonly path: string[], readonly error: string, options?: ErrorOptions) {
        super(error, options);
    }
}

interface Schema<in out Out, in out In = Out> {
    decode(value: In): Result<Out, DecodeError>;
    encode(value: Out): Result<In, EncodeError>;
}

export type Input<A> = A extends Schema<infer _, infer B> ? B : never;
export type Output<A> = A extends Schema<infer B, infer _> ? B : never;

export const brand = <B extends TransparentBrandConstructor<any>>(
    ctor: B,
): Schema<BrandOf<B>, Unbranded<BrandOf<B>>> => ({
    decode: (value: Unbranded<BrandOf<B>>) => new Ok(ctor(value)),
    encode: (value: BrandOf<B>) => new Ok(value as Unbranded<BrandOf<B>>),
});

export const refine = <B extends RefinedBrandConstructor<any>>(
    ctor: B,
): Schema<BrandOf<B>, Unbranded<BrandOf<B>>> => ({
    decode: (value: Unbranded<BrandOf<B>>) => {
        const message = ctor(value);
        if (typeof message === 'string') {
            return new Err(new DecodeError([], message));
        }
        return new Ok(message);
    },
    encode: (value: BrandOf<B>) => value as Unbranded<BrandOf<B>>,
});

export type SchemaFromFields<Fields extends Record<string, Schema<any>>> = Schema<
    {
        [K in keyof Fields]: Output<Fields[K]>;
    },
    {
        [K in keyof Fields]: Input<Fields[K]>;
    }
>;

export const struct = <Fields extends Record<string, Schema<any>>>(fields: Fields): SchemaFromFields<Fields> => {
    return {
        // @ts-expect-error Need to fix this to do error accumulation
        decode(value: Record<string, unknown>) {
            return Object.fromEntries(
                Object.entries(fields).map(([key, schema]) => [key, schema.decode(value[key])]),
            );
        },
        // @ts-expect-error Need to fix this to do error accumulation
        encode(value: Record<string, unknown>) {
            return Object.fromEntries(
                Object.entries(fields).map(([key, schema]) => [key, schema.encode(value[key])]),
            );
        },
    };
};

export const array = <A, I>(schema: Schema<A, I>): Schema<A[], I[]> => ({
    // @ts-expect-error Need to fix this to do error accumulation
    encode: (value: A[]): Result<I[], EncodeError> => new Ok(value.map(schema.encode)),
    decode: (value: I[]): Result<A[], DecodeError> => new Ok(value.map(schema.decode as any)),
});

const identity = <A>() => ({
    decode: (value: A) => new Ok(value),
    encode: (value: A) => new Ok(value),
});

export const string = identity<string>();
export const number = identity<number>();
export const boolean = identity<boolean>();

export const literal = <A extends string>(literal: A) => ({
    decode: (value: A) => value === literal ? new Ok(value) : new Err(new DecodeError([], `Expected ${literal}`, { cause: value })),
    encode: (value: A) => new Ok(value),
});
