import { jest } from '@jest/globals';

const query = jest.fn(async () => []);
jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));

const { paperEquitySnapshot } = await import('../../src/cli/paper.js');

test('paper equity snapshot CLI writes to equity_paper', async () => {
  await paperEquitySnapshot({ equity: 10150, source: 'live' });
  const statements = query.mock.calls.map(c => c[0]);
  expect(statements.some(s => s.includes('insert into equity_paper'))).toBe(true);
});
