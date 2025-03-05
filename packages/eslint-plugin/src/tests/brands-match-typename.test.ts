import { ruleTester } from "./rule-tester";
import * as brandsMatchTypename from "../brands-match-typename.ts";

ruleTester.run(brandsMatchTypename.name, brandsMatchTypename.rule, {
    valid: [
        `import { type Brand, transparent } from 'shield-ts';
    type UserId = string & Brand<'UserId'>`,
    ],
    invalid: [
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type UserId = string & Brand<'Whatever'>;
    `,
            errors: [{ messageId: "brandNotMatchTypename" }],
        },
    ],
});
