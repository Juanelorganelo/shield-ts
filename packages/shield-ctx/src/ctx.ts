import { Case } from "shield";
import type { IsEqual } from "shield/src/types";

const ctxPropPath = Symbol("@shield/ctx/ctxPropPath");
const ctxPropValue = Symbol("@shield/ctx/ctxPropValue");

export class DefaultCtxProp<in out Path extends string, Value> extends Case("DefaultCtxProp")<{
    readonly [ctxPropPath]: Path;
    readonly [ctxPropValue]: Value;
}> {}

export class OptionalCtxProp<in out Path extends string, Value> extends Case("NullableCtxProp")<{
    readonly [ctxPropPath]: Path;
    readonly [ctxPropValue]: Value | null | undefined;
}> {}

export type CtxProp<Path extends string, Value> = DefaultCtxProp<Path, Value> | OptionalCtxProp<Path, Value>;

export type AnyCtxProp = CtxProp<string, any>;

export type InferCtxPropValue<P extends AnyCtxProp> = P extends CtxProp<infer _, infer Value> ? Value : never;
export type InferCtxPropPath<P extends AnyCtxProp> = P extends CtxProp<infer Path, infer _> ? Path : never;

export function makeCtxProp<const Path extends string, Value>(path: Path): OptionalCtxProp<Path, Value>;
export function makeCtxProp<const Path extends string, Value>(
    path: Path,
    defaultValue: Value,
): DefaultCtxProp<Path, Value>;
export function makeCtxProp<const Path extends string, Value>(
    path: Path,
    defaultValue?: Value,
): CtxProp<Path, Value> {
    return {
        [ctxPropPath]: path,
        [ctxPropValue]: defaultValue,
    } as CtxProp<Path, Value>;
}

type FormatProps<P extends AnyCtxProp[], Acc extends string = ""> = P extends [
    infer Head extends AnyCtxProp,
    ...infer Tail extends AnyCtxProp[],
]
    ? FormatProps<
          Tail,
          `${Acc}${Tail extends [] ? Head[typeof ctxPropPath] : `${Head[typeof ctxPropPath]}, `}`
      >
    : Acc;

type CtxPropCheck<P extends AnyCtxProp[], Q extends AnyCtxProp> = P extends [
    infer Head,
    ...infer Tail extends AnyCtxProp[],
]
    ? IsEqual<Head, Q> extends 1
        ? Q
        : CtxPropCheck<Tail, Q>
    : // If we're here the prop Q was never found
      `Cannot get property ${Q[typeof ctxPropPath]} out of this context because it doesn't have it.
Available properties in this context are ${FormatProps<P>}`;

export interface Ctx<in out Props extends AnyCtxProp[]> {
    get<Prop extends AnyCtxProp>(prop: CtxPropCheck<Props, Prop>): Prop[typeof ctxPropValue];
    add<Prop extends AnyCtxProp>(prop: Prop, value: Prop[typeof ctxPropValue]): Ctx<[...Props, Prop]>;
    modify<Prop extends AnyCtxProp>(
        prop: Prop,
        modifer: (current: Prop[typeof ctxPropValue]) => Prop[typeof ctxPropValue],
    ): Ctx<Props>;
}

export function makeCtx<Props extends AnyCtxProp[]>(props?: Props): Ctx<Props> {
    let ctxProps = props ?? [];

    return {
        get(prop) {
            return props[prop[ctxPropPath]];
        },
        add(prop, value) {
            return makeCtx([...props, prop]);
        },
        modify(prop, modifer) {
            return makeCtx(props.map((p) => (p[ctxPropPath] === prop[ctxPropPath] ? { ...p, [ctxPropValue]: modifer(p[ctxPropValue]) } : p),
            );
        },
    } as Ctx<Props>;
}

const dbCtxProp = makeCtxProp<"db/test", string>("db/test");

declare function getContent(ctx: Ctx<[typeof dbCtxProp]>): string;

const content = getContent();

