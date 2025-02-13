import { ESLintUtils } from '@typescript-eslint/utils';

export interface ShieldPluginDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ShieldPluginDocs>(
  name => `https://github.com/shield-ts/packages/tree/main/eslint-plugin/docs/${name}.md`
);
