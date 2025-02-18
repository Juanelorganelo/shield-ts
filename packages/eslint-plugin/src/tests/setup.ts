import * as bun from "bun:test";

(global as any).describe = bun.describe;
(global as any).test = bun.test;
(global as any).expect = bun.expect;
(global as any).afterAll = bun.afterAll;
(global as any).afterEach = bun.afterEach;
(global as any).beforeAll = bun.beforeAll;
(global as any).beforeEach = bun.beforeEach;
