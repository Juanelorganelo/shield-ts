import {type Brand, nominal, Variant} from "../src";

// We can combine branded types with phantom types
// to leverage zero-overhead compile-time safety.
// Id<Template> wouldn't be assignable to Id<Course>
type Id<Phantom, Type = number> = Type & Brand<'Id'>;
const id = <Phantom, Type = number>(value: Type): Id<Phantom, Type> => {
    return value as Id<Phantom, Type>
}

type Email = string & Brand<'Email'>;

const email = nominal<Email>();

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

    type User = Admin | Instructor | Student;

    test('adds args to the instance as properties', () => {
        const admin = new Admin({
            id: id<Admin>(1),
            email: email('foo@admin.com'),
        });
        expect(admin.id).toEqual(id<Admin>(1));
        expect(admin.email).toEqual(email('foo@admin.com'));
    });
});