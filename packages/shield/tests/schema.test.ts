import { boolean, DecodeError, decodeUnknown, encode, number, string } from "../src/schema";

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
