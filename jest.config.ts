import type { Config } from "jest";

export default {
    preset: "ts-jest",
    testMatch: ["**/*.test.ts"],
    testEnvironment: "node",
} satisfies Config;
