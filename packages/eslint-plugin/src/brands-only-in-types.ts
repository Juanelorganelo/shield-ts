import { createRule } from "./create-rule";

export const name = 'brands-only-in-types';
export const rule = createRule({
  create(_context) {
    return {
      TSTypeAssertion(node) {},
      TSTypeAnnotation(node) {},
      TSInterfaceDeclaration(node) {},
      PropertyDefinition(node) {},
      TSAbstractPropertyDefinition(node) {},
    };
  },
  name,
  meta: {
    docs: {
      description: 'Ensures that the tag of a branded type matches the name for its `type` alias definition',
    },
    messages: {
      brandNotAllowed: 'Brand<_literal_> types can only be used in type definitions',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
})