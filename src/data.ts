import type { IsEqual } from "./types";

export interface DataConstructor {
  new <A extends Record<string, unknown> = {}>(args: IsEqual<A, {}> extends 1 ? void : A): A;
}

export function Data(): DataConstructor {
  abstract class DataClass {
    constructor(args?: Record<string, unknown>) {
      return new Proxy(this, {
        has(target, p) {
          if (args && Reflect.has(args, p)) return Reflect.get(args, p);
          return Reflect.has(target, p);
        },
        get(target, p, receiver) {
          if (args && Reflect.has(args, p)) return Reflect.get(args, p, receiver);
          return Reflect.get(target, p, receiver);
        },
      });
    }
  }
  return DataClass as DataConstructor;
}
