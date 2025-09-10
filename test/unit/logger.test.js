import { jest } from '@jest/globals';

test('logger respects APP_LOG_LEVEL', async () => {
  await jest.isolateModulesAsync(async () => {
    process.env.APP_LOG_LEVEL = 'error';
    const logs = [];
    const originalWrite = process.stdout.write;
    process.stdout.write = jest.fn((str) => {
      logs.push(str);
      return true;
    });

    const { logger } = await import('../../src/utils/logger.js');
    logger.info('hello');
    logger.error('world');

    process.stdout.write = originalWrite;
    delete process.env.APP_LOG_LEVEL;

    expect(logs.some((l) => l.includes('hello'))).toBe(false);
    expect(logs.some((l) => l.includes('world'))).toBe(true);
  });
});
