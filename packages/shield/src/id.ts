import { Brand } from "./brand";

/**
 * When writing applications it's very common to access data from a database and end up
 * with a type that's similar to this.
 * ```ts
 * interface User {
 *   id: number;
 *   email: string;
 * }
 *
 * interface Account {
 *   id: number
 *   name: string;
 * }
 * ```
 * Notice the `id` prop is typed as `number`. Now for small applications this might not be a problem, but as the application grows and the number of
 * entities in your DB grows, so does the risk of mixing up id's.
 * Take for example an Learning Management System (LMS) application there are courses and course templates.
 * Course templates have exactly the same data as courses, but they behave differently (i.e. can't be published) so it would be
 * a somewhat reasonable DB design to have just one table for them (at least in data).
 *
 * |id|name     |parent_id|
 * |--|---------|----------|
 * |1 |Math     |null      |
 * |2 |Biology  |null      |
 * |3 |Chemistry|1         |
 * |4 |Algebra  |1         |
 * |5 |Geometry |2         |
 *
 * Now we could argue that a better design would be to have two different tables,
 * but in this case the `id` prop is the same for both entities.
 *
 * ```ts
 * interface User {
 *   id: number;
 *   email: string;
 * }
 *
 * interface Course {
 *   id: number;
 *   balance: number;
 * }
 *
 * interface Transaction {
 *   id: number;
 *   amount: number;
 * }
 * ```
 *
 * The problem with this is that we can accidentaly mix up course and user id's.
 * To solve this problem we export an `Id<P, U>` type that distinguishes your id's at compile time
 * to avoid bugs.
 *
 * import { type Id } from 'shield-ts';
 *
 * @example
 * interface User { id: Id<User>, email: string }
 * interface Course { id: Id<Course>, name: string }
 *
 * // It's impossible to mix up user and course id's!
 * function getAssociatedAssignments(state, courseId: Id<Course>)
 *
 * // combined with _branded types_ we could have much stronger type-safety guarantees
 * import { refined } from "shield-ts"
 *
 * export type Email = string & Brand<'Email'>;
 * // Note that this is not exported.
 * // This is important since we want people to only get emails
 * // from actual email addresses.
 * const Email = refined<Email>();
 * interface SafeUser { id: Id<User>, email: Email }
 */
export type Id<_P, U extends string | number = number> = U & Brand<'Id'>;

/**
 * Creates an Id value of type Id<P, U>.
 * @param value The value of the id.
 */
export function id<P, U extends string | number = number>(value: U): Id<P, U> {
    return value as Id<P, U>;
}
