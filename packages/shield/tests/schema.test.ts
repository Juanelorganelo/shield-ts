import { Brand, transparent } from "../src";
import { boolean, brand, DecodeError, decodeUnknown, encode, number, string, union } from "../src/experimental/schema";

describe("string", () => {
    test("encodes strings", () => {
        const v = encode(string, "flop");
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as string).toBe("flop");
    });

    test("decodes strings", () => {
        const v = decodeUnknown(string, "flop");
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as string).toBe("flop");
    });
});

describe("number", () => {
    test("encodes numbers", () => {
        const v = encode(number, 2);
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as number).toBe(2);
    });

    test("decodes numbers", () => {
        const v = decodeUnknown(number, 2);
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as number).toBe(2);
    });
});

describe("boolean", () => {
    test("encodes booleans", () => {
        const v = encode(boolean, true);
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as boolean).toBe(true);
    });

    test("decodes booleans", () => {
        const v = decodeUnknown(boolean, true);
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as boolean).toBe(true);
    });
});

describe("union", () => {
    test("encodes union types", () => {
        const v = encode(union(string, number), "flop");
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as string).toBe("flop");

        const v2 = encode(union(string, number), 2);
        expect(v2).not.toBeInstanceOf(DecodeError);
        expect(v2 as number).toBe(2);
    });

    test("decodes union types", () => {
        const v = decodeUnknown(union(string, number), "flop");
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as string).toBe("flop");

        const v2 = decodeUnknown(union(string, number), 2);
        expect(v2).not.toBeInstanceOf(DecodeError);
        expect(v2 as number).toBe(2);
    });
});

describe("brand", () => {
    test("encodes transparent branded types", () => {
        type Flop = string & Brand<"Flop">;
        const Flop = transparent<Flop>();
        const schema = brand(Flop, string);

        const v = encode(schema, Flop("flop"));
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as Flop).toBe("flop");
    });

    test("decodes transparent branded types", () => {
        type Flop = string & Brand<"Flop">;
        const Flop = transparent<Flop>();
        const schema = brand(Flop, string);

        const v = decodeUnknown(schema, "flop");
        expect(v).not.toBeInstanceOf(DecodeError);
        expect(v as Flop).toBe("flop");
    });
});
