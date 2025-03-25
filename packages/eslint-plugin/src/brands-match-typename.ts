import { createRule } from "./create-rule";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

export const name = "brand-match-typename";
export const rule = createRule({
    create(context) {
        return {
            TSTypeAliasDeclaration(node) {
                const prefix = context.options[0]?.prefix ?? "";
                const typeName = node.id.name;
                if (node.typeAnnotation.type === "TSIntersectionType") {
                    const refs = node.typeAnnotation.types.filter(
                        // Can we ensure that this comes from shield-ts?
                        (type) => type.type === "TSTypeReference",
                    );
                    const brand = refs.find(
                        (ref) =>
                            ref.typeName.type === AST_NODE_TYPES.Identifier && ref.typeName.name === "Brand",
                    );

                    if (brand) {
                        const brandNameType = brand.typeArguments!.params[0]!;

                        if (brandNameType.type !== 'TSLiteralType') {
                            context.report({
                                node: brandNameType,
                                messageId: "brandMustBeAStringLiteral",
                            });
                            return;
                        }

                        const brandName =
                            brandNameType.literal.type === "Literal" &&
                            brandNameType.literal.value;

                        const expectedBrandName = `${prefix}${typeName}`;

                        // TODO: Assert that brandName is a string literal type.
                        if (brandName !== expectedBrandName) {
                            context.report({
                                node,
                                messageId: "brandMustMatchTypeName",
                            });
                        }
                    }
                }
            },
        };
    },
    name,
    meta: {
        docs: {
            description:
                "Ensures that the tag of a branded type matches the name for its `type` alias definition",
        },
        messages: {
            brandMustMatchTypeName: "The brand name passed to the Brand<> type must match the name of the `type` definition in which it is used",
            brandMustBeAStringLiteral: 'The type parameter passed to brand must be a string literal'
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
