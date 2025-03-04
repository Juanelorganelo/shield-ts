import type { IsEqual } from "./types";

/**
 * A constructor for Data objects.
 */
export interface DataConstructor {
    new <A extends Record<string, unknown> = {}>(args: IsEqual<A, {}> extends 1 ? void : A): A;
}

/**
 * A class factory function that returns a class you can extend to get.
 */
export function Data(): DataConstructor {
    abstract class DataClass {
        /**
         * The properties of the class.
         * @param args The properties assigned to the class.
         */
        constructor(args?: Record<string, unknown>) {
            return new Proxy(this, {
                has(target, p) {
                    if (args && Reflect.has(args, p)) return Reflect.get(args, p);
                    else return Reflect.has(target, p);
                },
                get(target, p, receiver) {
                    if (args && Reflect.has(args, p)) return Reflect.get(args, p, receiver);
                    else return Reflect.get(target, p, receiver);
                },
                set(target, p, newValue) {
                    throw new TypeError(
                        `Attempted to set property ${String(p)} on a data class. Properties on data classes are readonly`,
                    );
                },
            });
        }
    }
    return DataClass as DataConstructor;
}
