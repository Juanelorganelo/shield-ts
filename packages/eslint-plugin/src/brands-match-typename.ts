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
                        const brandName =
                            brandNameType.type === "TSLiteralType" &&
                            brandNameType.literal.type === "Literal" &&
                            brandNameType.literal.value;

                        const expectedBrandName = `${prefix}${typeName}`;

                        // TODO: Assert that brandName is a string literal type.
                        if (brandName !== expectedBrandName) {
                            context.report({
                                node,
                                messageId: "brandNotMatchTypename",
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
            brandNotMatchTypename: "Brand names for branded types must match their brand name",
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
