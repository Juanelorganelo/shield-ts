# :warning: WIP :warning:
This library is still under heavy development

# shield-ts

`shield-ts` is a TypeScript library for writing fast, secure and reliable TypeScript programs with as little runtime errors as we believe are (pragmatically) possible.

## Installation

_very soon_ `shield-ts` is available on the NPM Package Registry and JSR.

## Features
This is an _incomplete_ list of features

- [x] no `Option` type (we already have null-safety in TS with `strictNullChecks`)
- [x] support for discriminated unions a.k.a. algebraic data-types
- [x] support for tuple variants of discriminated unions
- [x] _branded types_ i.e. nominal typing for TypeScript using symbols and intersection types
- [x] (almost) zero-overhead type-safe wrappers for other types through branded types and `newtype`
- [x] No paradigm-biased. We don't prescribe functional programming. We just want more typesafety, not to change your programming model.
- [ ] Runtime serialization/deserialization fully type-safe (in progress).
- [ ] ESLint plugin and config that work seamlessly with the library.
- [ ] Compatible with Standard Schema

## Why?
There are already plenty of excelent libraries that provide similar functionalities and much more [(see Effect)](https://effect.website) the biggest problem I have with them being that since they all have `Option` and `Result` types, you end up having to wrap all the native APIs/libraries to handle errors the way the library wants you to. Another thing is that most of these libraries are heavily based around functional programming however all web and Node.js APIs use more of a OOP/strucutred programming aproach which makes the wrapping overhead much greater in some cases. This is mitigated by creating wrapper packages for APIs much like Effect did, the problem with that is now you have to re-learn all the APIs but much more importantly you most likely have to fundamentaly change the way you think about programming in TypeScript. Don't get me wrong, I still love Effect and use it all the time, I just want an alternative for some smaller projects that still require complex logic and algorithms.


## Concepts
### Discriminated unions (a.k.a. ADTs)
In TypeScript a _discriminated union_ is just a union of object types where they have a common property that's different between all of them, this is known as a _discriminant_.
`shield-ts` provides some useful utilities for working with discriminated unions.

```ts
import { Case } from 'shield-ts';

export class Admin extends Case("Admin")<{
  readonly id: number;
  readonly email: string;
}> {}
export class Instructor extends Case("Instructor")<{
  readonly id: number;
  readonly email: string;
}> {}
export class Student extends Case.Tuple("Student")<[string]> {}

export type User = Admin | Instructor | Student;

const admin: User = new Admin({ id: 2, email: "admin@edu.com" });
const instructor: User = new Instructor({ id: 3, email: "instructor@edu.com"})
const student: User = new Student("blep@bloop.com");

console.log(admin.email); // admin@edu.com
console.log(instructor.email); // instructor@edu.com
console.log(student.$0); // blep@bloop.com
```

### Branded types

A branded type is just a TypeScript type that's intersecting with a `Brand<{string_literal}>`.
This allows TypeScript to distinctly identify say `type Money = number & Brand<'Money'>` from `type Grams = number & Brand<'Grams'>` and allows us to create values of those types with (almost) zero runtime overhead.

> Comes with linter plugin to ensure that:
> 1. Branded types are only used inside type-definitions
> 2. The brand passed to a Brand<B> instantiation MUST match the name of the type alias. We allow for module and org prefixes
> ```ts
> import

#### Example

```ts
import { type Brand, transparent } from "shield-ts";

type Grams = number & Brand<'Grams'>;
const grams = transparent<Grams>();

type Milligrams = number & Brand<'Milligrams'>;
const milligrams = transparent<Milligrams>();

declare function doSomeMgCalc(mg: Milligrams): Grams;

doSomeMgCalc();
```

#### Caveats

~~Because of limitations with TypeScript (in particular lack of higher-kinded polymorphism or metaprogramming facilities) we can't currently create brand constructors for a type with generic parameters.~~

> This could actually be done if I can figure out a less verbose API than what is currently available in the wild to do something like [this](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf) in TypeScript. In the meantime, the following instructions are still relevant.

With our current implementation, we can't automatically construct the type signature for you at the moment.
You can however, create constructor the type by hand.

```ts
import { type Brand } from 'shield-ts';

export type Id<P> = number & Brand<'Id'>;
// We need an ugly cast for this to work :c
export const id = <P>(value: number): Id<P> => value as unknown as Id<P>;
```

For this and other reasons `shield-ts` exports commonly used branded types which includes an `Id` type that's very similar to the one defined above.

### Refined types

A _refined type_ is a [_branded type_](#branded-types) coupled with what's often refered to as _smart constructors_ in functional programming languages. A _smart constructor_, is just a function that creates a value of a given _branded type_ while checking the validity of the data at runtime. Values of said type can't be created by wraping/unwraping (without unsafe assertions at least) and thus can only be created with the _smart constructor_(s) defined for it.

In `shield-ts` smart constructors are created by defining a _branded type_ and using `refined` to define constructor functions for it.

#### Example

```ts
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

  // All Email values are also valid strings but not the other way around.
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
```ts
namespace Parser {
    // Notice the variance annotation.
    // Invariant phantom type parameters is probably what you want
    // but there may be other use cases for phantom types in TS.
    interface Parser<in out _State> {
        readonly input: string
        readonly parsed: string[]
        readonly current: number
    }

    class Local extends Case("Local") {}
    class Domain extends Case("Domain") {}

    export const make = (input: string): Parser<Local> => ({
        input,
        parsed: [],
        current: 0,
    })

    export const parseLocal = (self: Parser<Local>): Parser<Domain> => {
        let current = self.current

        const parsed = []
        while (current < self.input.length) {
            parsed.push(self.input.charAt(current))
            ++current
        }

        return { ...self, parsed }
    }

    export const parseDomain = (self: Parser<Domain>): string => {
        let current = self.current

        const parsed: string[] = []
        while (current < self.input.length) {
            parsed.push(self.input.charAt(current))
            ++current
        }

        return [...self.parsed, ...parsed].join('')
    }
}
```

Using this API is safer since you can only call `parseDomain` with a `Parser<Domain>` value and the only (safe) way to produce one
is by calling the `parseLocal` function. This effectively encodes the parser constraints at compile-time since trying to call `parseDomain` with a `Parser<Local>` the program will fail to compile with the message `"Type Parser<Local> is not assignable to Parser<Domain>. Type Local is not assignable to type Domain".`. Same goes for the `parseLocal`

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
- [ ] research and design an API for lighweight higher-kinded polymorphism in TypeScript
    - [ ] as an alternative, research feasabilty of internal usage only
- [ ] add a runtime type system with standard schema compatibility
    - [ ] research a set-theoretic foundation for the runtime type system
    - [ ] research set-theoretic HKTs
- [ ] revisit design for the API for ADTs
- [x] research linter rules feasability
  - [x] tags for discriminated unions and branded types MUST match their constructor name
    > NOTE: add option to allow for prepending the module name and/or literal prefixes e.g. org name
- [ ] add linter configuration
  - [ ] custom rules
  - [ ] existing typescript rules
- [ ] add tests
- [ ] write real-world examples
- [ ] write documentation
