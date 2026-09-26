import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionRefresher } from '../src/utils/refreshSession.js';

test('concurrent 401s share one refresh; later requests reuse another tab token', async () => {
  let token = 'old', calls = 0;
  const refresh = createSessionRefresher({ read: () => token, renew: async () => { calls++; return {token:'new'}; }, save: session => { token=session.token; } });
  assert.deepEqual(await Promise.all([refresh('old'),refresh('old')]), ['new','new']);
  assert.equal(calls,1);
  assert.equal(await refresh('old'),'new'); assert.equal(calls,1);
});
test('logout during refresh wins and cannot resurrect credentials', async () => {
  let token='old', finish;
  const refresh = createSessionRefresher({ read: () => token, renew: () => new Promise(resolve => { finish=resolve; }), save: () => assert.fail('must not save') });
  const pending = refresh('old'); await Promise.resolve();
  token=null; finish({ token:'new' });
  await assert.rejects(pending,/Session changed/);
});
