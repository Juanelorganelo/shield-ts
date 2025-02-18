import { createRule } from "./create-rule";

export const name = 'brand-match-typename';
export const rule = createRule({
  create(_context) {
    return {
      TSTypeAliasDeclaration(node, ...rest) {
        console.log('node', node);
        console.log('rest', rest);
      },
      TSTypeAnnotation(node, ...rest) {
        console.log('node', node);
        console.log('rest', rest);
      }
    };
  },
  name,
  meta: {
    docs: {
      description: 'Ensures that the tag of a branded type matches the name for its `type` alias definition',
    },
    messages: {
      brandNotMatchTypename: 'Brand names for branded types must match they\'re brand name',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
})