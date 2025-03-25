import { ruleTester } from "./rule-tester";
import { name, rule } from "../cases-match-classname";

ruleTester.run(name, rule, {
    valid: [
        `import { Case } from 'shield-ts'
        class Node<A> extends Case.Tuple("Node")<[A]> {}
        class Leaf<A> extends Case("Leaf")<{ left: Tree<A>, right: Tree<A> }> {}
        type Tree<A> = Node<A> | Leaf<A>`,
        `function Y(tag: string): Function {}
        class X extends Y("X") {}`
    ],
    invalid: [
        {
            code: `
                import { Case } from 'shield-ts'
                class Node<A> extends Case.Tuple("NodeF")<[A]> {}
                class Leaf<A> extends Case("LeafFA")<{ left: Tree<A>, right: Tree<A> }> {}
                type Tree<A> = Node<A> | Leaf<A>`,
            errors: [
                { messageId: "tagDidNotMatchClassName" }
            ]
        },
        {
            code: `
                import { Case } from 'shield-ts'
                const flopTag: string = "Flop";
                class Flop extends Case(flopTag) {}`,
            errors: [
                { messageId: 'tagIsNotStringLiteral' }
            ]
        }
    ],
});
