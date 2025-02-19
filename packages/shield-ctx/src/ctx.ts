import { Case } from "shield";

const ctxPropValue = Symbol("@shield/ctx/ctxPropValue");
const ctxPropPath = Symbol('@shield/ctx/ctxPropPath');

export interface BaseCtxProp<in out Path extends string, Value> {
  readonly tag: 'BaseCtxProp';
  readonly [ctxPropPath]: Path;
  readonly [ctxPropValue]?: Value;
}

export interface DefaultCtxProp<in out Path extends string, Value> extends BaseCtxProp<Path, Value> {
  readonly tag: 'DefaultCtxProp';
}

export type AnyCtxProp = BaseCtxProp<string, any>;

type PathToRecord<
  Path extends string,
  Value,
  Acc = {},
  First = true,
> = Path extends `${infer _Head}${infer Tail}`
  ? PathToRecord<Tail, Value, First extends true ? First : Acc>
  : Acc;

function makeCtxProp<const Path extends string, Value>(
  path: Path,
  defaultValue?: Value,
): BaseCtxProp<Path, Value> {
  return {
    [ctxPropPath]: path,
    [ctxPropValue]: defaultValue,
  }
}

interface Ctx<in out Props extends AnyCtxProp> {
  get<P extends AnyCtxProp>(prop: P)
}
