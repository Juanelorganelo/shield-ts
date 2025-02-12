# SafeZone
SafeZone is a library for writing fast, secure and reliable TypeScript
programs.

## Principles
- We don't need [Option](https://en.wikipedia.org/wiki/Option_type) TypeScript is already `null` safe with `strictNullChecks` on.
- Use as much of the existing type system types
- Keep the types/tools simple but powerful
- Prefer linting to overly complex/hacky type definitions

## Installation
SafeZone packages are available on the NPM Package Registry under the @safezone/ scope.

## Usage
```typescript
import {
    Result,
    Variant,
    VariantTuple,
    Branded,
} from '@safezone/core';

declare function isEmail(string: string): boolean;
// Branded types.
// This are runtime wrappers that perform parsing
// and ensure that the create type is always correct.
type Email = string & Branded<'Email'>;
const email = refined<Email>(value => isEmail(value) ? null : `Invalid email address ${value}`);

// We can be sure at compile-time that email is a valid email.
declare function sendEmail(email: Email): Promise<string>;

// Variants
// This are classes that form the cases of a discriminated union
class Admin extends Variant.Tuple("Admin")<[string]> {}
class Instructor extends Variant.Tuple("Instructor")<[string]> {}
class Student extends Variant.Record("Student")<{ email: string, name: string }> {}
type Role = Admin | Instructor | Student;

function hasPerms(role: Role) {
    // We already get autocomplete and exahustiveness checking
    // with switch and discriminated unions, no need for weird
    // match methods that obscure the implementation.
    switch (role.tag) {
        case 'Admin':
        case 'Instructor':
            // TypeScript's type guards will allow you to access
            // email address as role.$0
            console.log(role.$0);
            return true;
        case 'Student':
            // Type guards will also work here
            console.log(role.name);
            console.log(role.email);
            return false;
    }
}
```

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.43. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## TODO
- [ ] add linter rules
    - functions that throw MUST have never in they're return type
    - functions with never as their return type MUST throw
    - tags for discriminated unions and branded types MUST match their constructor name
        > NOTE: add option to allow for prepending the module name and/or literal prefixes e.g. org name
    - branded types "brands" MUST match their type name
- [ ] add linter configuration
    - custom rules
    - prefer-readonly-types
- [ ] add tests
- [ ] write real-world examples
- [ ] write documentation