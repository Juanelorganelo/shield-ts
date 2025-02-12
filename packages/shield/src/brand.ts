import type { UnionToIntersection } from "./types.ts";

const brandTypeId = Symbol.for("brandTypeId");

type AnyBrand = Brand<string>;

export interface Brand<in out Tag extends string | symbol> {
  readonly [brandTypeId]: {
    readonly [K in Tag]: Tag;
  };
}

export type Brands<P> =
  P extends Brand<string>
    ? UnionToIntersection<
        {
          [k in keyof P[typeof brandTypeId]]: k extends string | symbol ? Brand<k> : never;
        }[keyof P[typeof brandTypeId]]
      >
    : never;

export type Unbranded<A extends AnyBrand> = A extends infer U & Brands<A> ? U : never;

export interface TransparentBrandConstructor<A extends AnyBrand> {
  (value: Unbranded<A>): A;
}

export interface RefinedBrandConstructor<A extends AnyBrand> {
  (value: Unbranded<A>): A | never;

  null(value: Unbranded<A>): A | null;
  throw(value: Unbranded<A>): A | never;
}

export class BrandedTypeError extends Error {}

export function transparent<A extends AnyBrand>(): TransparentBrandConstructor<A> {
  /**
   * An (almost) zero-cost 'newtype' style wrapper for the underlying type of branded type A.
   * @param value A value of the underlying type of branded type A
   */
  return <A extends AnyBrand>(value: Unbranded<A>): A => value as A;
}

export function refined<A extends AnyBrand>(
  validate: (value: Unbranded<A>) => null | BrandedTypeError,
): RefinedBrandConstructor<A> {
  function ctor(value: Unbranded<A>): A | BrandedTypeError {
    const message = validate(value);
    if (message instanceof BrandedTypeError) {
      return message;
    }
    return value as A;
  }

  function _null(value: Unbranded<A>): A | null {
    const message = validate(value);
    if (message) {
      return null;
    }
    return value as A;
  }

  function _throw(value: Unbranded<A>): A | never {
    const message = validate(value);
    if (message) {
      throw message;
    }
    return value as A;
  }

  (ctor as RefinedBrandConstructor<A>).null = _null;
  (ctor as RefinedBrandConstructor<A>).throw = _throw;
  return ctor as RefinedBrandConstructor<A>;
}
