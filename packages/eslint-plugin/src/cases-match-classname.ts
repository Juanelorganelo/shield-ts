import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "./create-rule";

const isStringValue = (rawValue: string): boolean =>
    rawValue.startsWith("'") || rawValue.startsWith('"') || rawValue.startsWith("`");

export const name = "cases-match-classname";
export const rule = createRule({
    create(_context) {
        return {
            ClassExpression(node) {
                if (
                    // TODO: Trace the node back to it's import statement and checking the module path
                    // as well as the calle name on the superClass expression to avoid ambiguity
                    node.superClass?.type === AST_NODE_TYPES.CallExpression &&
                    node.superClass.callee.type === AST_NODE_TYPES.Identifier &&
                    (node.superClass.callee.name === "Case" || node.superClass.callee.name === "Case.Tuple")
                ) {
                    const [param] = node.superClass.arguments;

                    // Prevents against passing a tag with a type that
                    // gets narrowed to string
                    if (param) {
                        if (param.type !== "Literal" || !isStringValue(param.raw)) {
                            _context.report({
                                node: param,
                                messageId: "tagIsNotStringLiteral",
                            });
                            return;
                        }
                        const { value } = param;

                        if (node.id?.name) {
                            if (value !== node.id?.name) {
                                _context.report({
                                    node,
                                    messageId: "tagDidNotMatchClassName",
                                });
                                return;
                            }
                        } else {
                            switch (node.parent.type) {
                                case AST_NODE_TYPES.VariableDeclarator:
                                    if (value !== (node.parent.id as { name: string }).name) {
                                        _context.report({
                                            node,
                                            messageId: "tagDidNotMatchClassName",
                                        });
                                    }
                            }
                        }
                    }
                }
            },
            ClassDeclaration(node) {
                if (
                    // TODO: Trace the node back to it's import statement and checking the module path
                    // as well as the calle name on the superClass expression to avoid ambiguity
                    node.superClass?.type === AST_NODE_TYPES.CallExpression &&
                    node.superClass.callee.type === AST_NODE_TYPES.Identifier &&
                    (node.superClass.callee.name === "Case" || node.superClass.callee.name === "Case.Tuple")
                ) {
                    const [param] = node.superClass.arguments;

                    // Prevents against passing a tag with a type that
                    // gets narrowed to `string`
                    if (param) {
                        if (param.type !== "Literal" || !isStringValue(param.raw)) {
                            _context.report({
                                node: param,
                                messageId: "tagIsNotStringLiteral",
                            });
                            return;
                        }
                        const { value } = param;
                        if (value !== node.id?.name) {
                            _context.report({
                                node,
                                messageId: "tagDidNotMatchClassName",
                            });
                            return;
                        }
                    }
                }
            },
        };
    },
    name,
    meta: {
        docs: {
            description: "Ensures that the tag of a discriminated union case matches the name of it's class",
        },
        messages: {
            tagIsNotStringLiteral: "The value passed to Case or Case.Tuple must be a string literal",
            tagDidNotMatchClassName:
                "The tag passed to Case or Case.Tuple must match the class declaration name",
        },
        type: "suggestion",
        schema: [
            {
                type: "object",
                properties: {
                    prefix: { type: "string" },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{ prefix: "" }],
});
