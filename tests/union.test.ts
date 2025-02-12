import {type Brand, transparent, Case } from "../src";


describe('Case', () => {
    type Email = string & Brand<'Email'>;
    const email = transparent<Email>();

    class Admin extends Case("Admin")<{
        readonly id: number,
        readonly email: Email,
    }> {
    }

    test('adds args to the instance as properties', () => {
        const admin = new Admin({
            id: 1,
            email: email('foo@admin.com'),
        });
        expect(admin.id).toBe(1);
        expect(admin.email).toBe(email('foo@admin.com'));
    });
});

describe('Case.Tuple', () => {
    class Token extends Case.Tuple('Token')<[string]> {}
    test('adds args as properties with the following format `$${argIndex}`', () => {
        const token = new Token('flop');
        expect(token.$0).toBe('flop');
    });
});