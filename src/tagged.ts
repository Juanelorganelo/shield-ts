
export interface Tagged {
    readonly _: symbol;
}

/**
 * The underlying 'type' of a Tagged type.
 */
type TaggedType<T extends Tagged> = T extends (infer U & { readonly _: symbol })
    ? U
    : never;

/**
 * Creates a function that constructs values of type T
 */
export function tagged<T extends Tagged>() {
    return function taggedConstructor(value: TaggedType<T>): T {
        return value as T
    }
}
