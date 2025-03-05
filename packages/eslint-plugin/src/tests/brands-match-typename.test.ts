import { ruleTester } from "./rule-tester";
import * as brandsMatchTypename from "../brands-match-typename.ts";

ruleTester.run(brandsMatchTypename.name, brandsMatchTypename.rule, {
    valid: [
        `import { type Brand, transparent } from 'shield-ts';
    type UserId = string & Brand<'UserId'>`,
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type Foo = string & Brand<'@org/Foo'>;
    `,
            options: [{ prefix: '@org/' }],
        },
    ],
    invalid: [
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type UserId = string & Brand<'Whatever'>;
    `,
            errors: [{ messageId: "brandNotMatchTypename" }],
        },
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type Foo = string & Brand<'@org/Foo'>;
    `,
            options: [{ prefix: '@blop/' }],
            errors: [{ messageId: "brandNotMatchTypename" }],
        },
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type Foo = string & Brand<'@org/Foo'>;
    `,
            errors: [{ messageId: "brandNotMatchTypename" }],
        },
        {
            code: `import { type Brand, transparent } from 'shield-ts';
    type Foo = string & Brand<'@org/Bar'>;
    `,
            errors: [{ messageId: "brandNotMatchTypename" }],
        },
    ],
});
