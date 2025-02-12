import {type Brand, refined, Variant} from "../src";

// We can combine branded types with phantom types
// to leverage zero-overhead compile-time safety.
// Id<Template> wouldn't be assignable to Id<Course>
type Id<Phantom, Type = number> = Type & Brand<'Id'>;

type Email = string & Brand<'Email'>;

const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const email = refined<Email>(
    value => value.toLowerCase().match(EMAIL_REGEXP) ? null : `Invalid email address: ${value}`,
);

describe('Variant', () => {
    class Admin extends Variant.Record("Admin")<{
        readonly id: Id<Admin>,
        readonly email: Email,
    }> {
    }

    class Instructor extends Variant.Tuple("Instructor")<[Id<Instructor>]> {
    }

    class Student extends Variant.Record("Student")<{
        readonly id: Id<Student>,
        readonly email: Email,
    }> {
    }

    type Role = Admin | Instructor | Student;

    test('adds args to the instance as properties', () => {
        class X extends Variant.Record("X")<{ x: number, y: string }> {
        }

        const x = new X({x: 1, y: "w"});
        expect(x).toHaveProperty("x", 1);
        expect(x).toHaveProperty("y", "w");
    });
});