# :warning: WIP :warning:

# shield-ts

`shield-ts` is a TypeScript library for writing fast, secure and reliable TypeScript programs with as little runtime errors as we believe are (pragmatically) possible.

## Installation

`shield-ts` is available on the NPM Package Registry and JSR.

## Features

### Library

- [x] no `Option` type (we already have null-safety in TS with `strictNullChecks`)
- [x] support for discriminated unions a.k.a. algebraic data-types
- [x] support for tuple variants of discriminated unions
- [x] _branded types_ i.e. nominal typing for TypeScript using symbols and intersection types
- [x] (almost) zero-overhead type-safe wrappers for other types through branded types and `newtype`
- [ ] has an (optional) ESLint configuration for top-notch DX

## Concepts

### Branded types

A branded type is just a TypeScript type that's intersecting with a `Brand<{string_literal}>`.
This allows TypeScript to distinctly identify say `type Money = number & Brand<'Money'>` from `type Grams = number & Brand<'Grams'>` and allows us to create values of those types with (almost) zero runtime overhead.

#### Example

```typescript
import { type Brand, branded } from "shield-ts";
```

#### Caveats

Because of limitations with TypeScript (in particular lack of higher-kinded polymorphism or metaprogramming facilities) we can't currently create brand constructors for a type with generic parameters.

```typescript

```

### Refined types

A _refined type_ is a [_branded type_](#branded-types) coupled with what's often refered to as _smart constructors_ in functional programming languages. A _smart constructor_, is just a function that creates a value of a given _branded type_ while checking the validity of the data at runtime. Values of said type can't be created by wraping/unwraping (without unsafe assertions at least) and thus can only be created with the _smart constructor_(s) defined for it.

In `shield-ts` smart constructors are created by defining a _branded type_ and using `refined` to define constructor functions for it.

#### Example

```typescript
import { type Brand, refined } from "shield-ts";

// Branded types.
// This are runtime wrappers that perform parsing
// and ensure that the create type is always correct.
type Email = string & Brand<"Email">;
const isEmailAddress = (value: string): boolean => {
  // Email-checking logic...
};
const email = refined<Email>((value) => (isEmailAddress(value) ? null : `Invalid email address ${value}`));

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

const emailInput = document.getElementById("user-email");
emailInput.addEventListener("change", async (event) => {
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

### Phantom types

_phantom types_ aren't a `shield-ts` concept but more of a general programming concept. A phantom type is at it's core a type parameter that's not used in the type definition. You may wonder what's the point of declaring an unsued type parameter, well when used in conjuction with branded types we can use it to encode information at compile-time about the behaviour of our program.

```ts
import { type Brand, branded, Case, Data } from "shield-ts";

export type Id<Tid, A> = A & Brand<"Id">;
/**
 * We can't create constructors for branded types with generics
 * but you can define them yourself by hand.
 * For this reason, we export commonly used branded types with generics.
 * As such, the type define in this example is already bundled with the library.
 */
export const id = <Tid, A>(value: A): Id<Tid, A> => value as Id<Tid, A>;

export type Username = string & Brand<"Username">;
export const username = branded<Username>();

export class User extends Data<{
  readonly id: Id<User, number>;
  readonly username: Username;
}> {}
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

- [ ] add Zod compatibility
- [ ] rename `Variant.Record` to `Case` and `Variant.Tuple` to `Case.Tuple`
- [ ] research linter rules feassability
  - [ ] functions that use `throw` MUST have `never` in their return type
  - [ ] functions with `never` as their return type MUST throw or call a `throw`ing function. These can be added by adding the function name to a list and checking node names (I think)
  - [ ] tags for discriminated unions and branded types MUST match their constructor name
    > NOTE: add option to allow for prepending the module name and/or literal prefixes e.g. org name
- [ ] add linter configuration
  - [ ] custom rules
  - [ ] existing typescript rules
  - [ ] research using eslint-plugin-functional
- [ ] add tests
- [ ] write real-world examples
- [ ] write documentation

This project was created using `bun init` in bun v1.1.43. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
