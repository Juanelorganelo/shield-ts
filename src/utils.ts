/**
 * A type-safe version of String.prototype.startsWith
 */
export const startsWith: <const S extends string>(self: string, check: S) => self is `${S}${string}` = String
  .prototype.startsWith as any;
