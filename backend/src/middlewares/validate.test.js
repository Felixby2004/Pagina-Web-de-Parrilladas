import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { validate } from './validate.js';

test('validate parses query params for list endpoints', () => {
  const schema = z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number).optional(),
    search: z.string().optional().default(''),
  });

  const req = {
    query: {
      page: '2',
      limit: '5',
      search: 'pollo',
    },
  };
  const res = {};
  let nextCalled = false;

  validate(schema, 'query')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.query, { page: 2, limit: 5, search: 'pollo' });
});
