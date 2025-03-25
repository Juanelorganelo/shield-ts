import type { ESLint } from "eslint";
import { rule as brandsMatchTypename } from "./brands-match-typename";

export default {
    rules: brandsMatchTypename,
} satisfies ESLint.Plugin;

