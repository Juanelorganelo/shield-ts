# :warning: WIP :warning:
# shield-ts
`shield-ts` is a TypeScript library for writing fast, secure and reliable TypeScript programs with as little runtime errors as we believe are (pragmatically) possible.

## Installation
`shield-ts` is available on the NPM Package Registry and JSR.

## Features
### Library
- [X] no `Option` type (we already have null-safety in TS with `strictNullChecks`)
- [X] support for discriminated unions a.k.a. algebraic data-types
- [X] support for tuple variants of discriminated unions
- [X] _branded types_ i.e. nominal typing for TypeScript using symbols and intersection types
- [X] (almost) zero-overhead type-safe wrappers for other types through branded types and `newtype` 
- [ ] has an (optional) ESLint configuration for top-notch DX

## Concepts
### Refined types
In `shield-ts`, a _refined type_ is a TypeScript-first implementation of what's often refered to as _smart constructors_ in functional programming languages. A _smart constructor_, is just a function that creates a value of a given _branded type_ while checking the validity of the data at runtime. Values of said type can't be created by wraping/unwraping (without unsafe assertions at least) and thus can only be created with the _smart constructor_(s) defined for it.

In `shield-ts` smart constructors are created by defining a _branded type_ and using `refined` to define constructor functions for it.

```typescript
import { type Brand, refined } from 'shield-ts';


// Branded types.
// This are runtime wrappers that perform parsing
// and ensure that the create type is always correct.
type Email = string & Brand<'Email'>;
const isEmailAddress = (value: string): boolean => {
    // Email-checking logic...
};
const email = refined<Email>(
    value => isEmailAddress(value) ? null : `Invalid email address ${value}`
);

class SmtpClient {
    readonly _: unique symbol;
    send(address: Uint8Array, contents: Unit8Array): Promise<void> {
        // Send logic...
    }
}

// We can be sure at compile-time that email is a valid email
// since we can only construct values of type Email with the `email` function.
async function sendEmail(email: Email): Promise<string> {
    const smtp = new SmtpClient();

    // All Email values are 
    const address = new TextEncoder().encode(email);
    const contents = new TextEncoder().encode("Hello");
    await smtp.send(address, contents);
}

const emailInput = document.getElementById('user-email');
emailInput.addEventListener('change', async event => {
    // Several options for convertion string to Email
    // This option returns a union of Email | BrandedTypeError you can use
    // to display a message to your user in whichever framework you're using
    // Something nice is that to use the Email value you need to check for
    // instances of Error and handle them. This is the default option.
    // The type annotation is optional.
    const address: Email | BrandTypeError = email(event.target.value);

    if (BrandTypeError.is(address)) {
        alert(address.toString());
        return;
    }
    
    // Because of the if-statement above TypeScript knows that
    // address can only be of type Email.
    await sendEmail(address);
});

// Some other options for creating values of a refined branded type.
// This option returns null if the email validation fails.
// You don't need to use instanceof checks but you loose the error message.
// this maybe suitable if you don't really care about why something failed.
// const address: Email | null = email.null(event.target.value);

// This option throws if validation fails.
// Very useful when prototyping.
// const address = email.throw(event.target.value);
```

## Development

### Install dependencies
```bash
bun install
```

Run the tests:
```bash
bun test
```

## TODO
- [ ] rename `Variant.Record` to `Case` and `Variant.Tuple` to `Case.Tuple`
- [ ] research linter rules feassability
    - [ ] functions that use `throw` MUST have `never` in their return type
    - [ ] functions with `never` as their return type MUST throw or call a `throw`ing function. These can be added by adding the function name to a list and checking node names (I think)
    - [ ] tags for discriminated unions and branded types MUST match their constructor name
        > NOTE: add option to allow for prepending the module name and/or literal prefixes e.g. org name
- [ ] add linter configuration
    - custom rules
    - existing typescript rules
    - maybe use eslint-plugin-functional for some?
- [ ] add tests
- [ ] write real-world examples
- [ ] write documentation

This project was created using `bun init` in bun v1.1.43. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.