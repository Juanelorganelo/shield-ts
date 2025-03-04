/**
 * Runtime serialization/deserialization for typesafe data.
 * Uses all the power of shield-ts validation to ensure type safety and consistency accross your application.
 */
import { BrandConstructor } from "./brand";

export class EncodeError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
    }
}

export class DecodeError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
    }
}

export interface Schema<in out Out, in out In = Out> {
    type: string;
    is(value: unknown): value is In;
    decode: (value: In) => Out | DecodeError;
    encode: (value: Out) => In | EncodeError;
}

type SchemaConfig<Out, In> = {
    [K in keyof Schema<Out, In>]: Schema<Out, In>[K];
};

const identity = <A>(value: A): A => value;
const makeSchema = <Out, In = Out>(schema: SchemaConfig<Out, In>): Schema<Out, In> => schema;

export const string = makeSchema<string>({
    type: "string",
    is: (value) => typeof value === "string",
    decode: identity,
    encode: identity,
});

export const number = makeSchema<number>({
    type: "number",
    is: (value) => typeof value === "number",
    decode: identity,
    encode: identity,
});

export const boolean = makeSchema<boolean>({
    type: "boolean",
    is: (value) => typeof value === "boolean",
    decode: identity,
    encode: identity,
});


export const or: {
    <A, A2, I, I2>(s: Schema<A, I>, s2: Schema<A2, I2>): Schema<A | A2, I | I2>;
    <A, A2, A3, I, I2, I3>(
        s: Schema<A, I>,
        s2: Schema<A2, I2>,
        s3: Schema<A3, I3>,
    ): Schema<A | A2 | A3, I | I2 | I3>;
} = (...schemas: Schema<unknown>[]): Schema<unknown> =>
    makeSchema({
        type: "or",
        is: (value): value is unknown => schemas.some((schema) => schema.is(value)),
        decode: (value) => {
            for (const schema of schemas) {
                const result = schema.decode(value)
                if (!(result instanceof DecodeError)) {
                    return result
                }
            }
            return new DecodeError(`No schema matched`)
        },
        encode: value => {
            for (const schema of schemas) {
                const result = schema.decode(value)
                if (!(result instanceof EncodeError)) {
                    return result
                }
            }
            return new EncodeError(`No schema matched`)
        },
    });

export const brand = <A extends BrandConstructor<any>>(
    make: A,
    schema: Schema<ReturnType<A>, Parameters<A>[0]>,
) => {
    type In = Parameters<A>[0];
    type Out = ReturnType<A>;

    return makeSchema<Out, In>({
        // FIXME:
        // This needs to be coupled with a linter rule for it to work properly
        type: `Brand<${make.name}>`,
        is: schema.is,
        decode: (value) => {
            const r = schema.decode(value);
            if (r instanceof DecodeError) return r;
            else return make(r);
        },
        encode: (value) => {
            const r = schema.encode(value);
            if (r instanceof EncodeError) return r;
            else return make(r);
        },
    });
};

export const decodeUnknown = <Out, In = Out>(schema: Schema<Out, In>, value: unknown) => {
    if (schema.is(value)) {
        return schema.decode(value);
    } else {
        return new DecodeError(`Unable to decode value of type ${typeof value} into schema ${schema.type}`);
    }
};

export const encode = <Out, In = Out>(schema: Schema<Out, In>, value: Out) => {
    if (schema.is(value)) {
        return schema.encode(value);
    } else {
        return new EncodeError(`Unable to encode value of type ${typeof value} into schema ${schema.type}`);
    }
};
