import { afterAll, describe, it } from 'bun:test';
import { RuleTester } from '@typescript-eslint/rule-tester';

RuleTester.it = it;
RuleTester.describe = describe;
RuleTester.afterAll = afterAll;

export const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts'],
      },
      tsconfigRootDir: process.cwd(),
    },
  },
});
