import test from 'node:test';
import assert from 'node:assert/strict';
import { geocodePlace, resolveActivityCoords } from '../src/utils/geocode.js';
globalThis.localStorage = { getItem: () => null, setItem() {} };
const hit = (lat = 13, lng = 100) => ({ ok: true, json: async () => ({ features: [{ geometry: { coordinates: [lng, lat] }, properties: { name: 'Place' } }] }) });
test('DB coordinates render without any external request', async () => {
  globalThis.fetch = () => { throw new Error('Must not fetch'); };
  const snapshots = [];
  const result = await resolveActivityCoords([{ id: 1, latitude: 13, longitude: 100 }], '', s => snapshots.push(s));
  assert.equal(result[0].lat, 13); assert.equal(snapshots[0][0].lng, 100);
});
test('first pin appears before slowest lookup completes, duplicate names share one request', async () => {
  let release, count = 0;
  globalThis.fetch = async url => {
    count++;
    if (url.searchParams.get('q') === 'slow') await new Promise(r => { release = r; });
    return hit();
  };
  const snapshots = [];
  const pending = resolveActivityCoords([{ id: 1, locationName: 'fast' }, { id: 2, locationName: 'slow' }, { id: 3, locationName: 'fast' }], '', s => snapshots.push(s));
  await new Promise(r => setTimeout(r, 10));
  assert.ok(snapshots.some(s => s[0].lat === 13 && s[1].lat === null && s[2].lat === 13));
  release(); await pending; assert.equal(count, 2);
  await resolveActivityCoords([{ id: 1, locationName: 'fast' }]); assert.equal(count, 2);
});
test('concurrent callers deduplicate requests and cancelling one does not cancel the other', async () => {
  let release, count = 0;
  globalThis.fetch = async (url, { signal }) => { count++; await new Promise((r, reject) => { release = r; signal.addEventListener('abort', () => reject(signal.reason)); }); return hit(); };
  const controller = new AbortController();
  const one = geocodePlace('shared-request', '', { signal: controller.signal });
  const two = geocodePlace('shared-request');
  controller.abort(); await assert.rejects(one); release();
  assert.equal((await two).lat, 13); assert.equal(count, 1);
});
test('leaving page aborts network and prevents queued requests and callbacks', async () => {
  let count = 0, updates = 0;
  globalThis.fetch = (url, { signal }) => { count++; return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason))); };
  const controller = new AbortController();
  const promise = resolveActivityCoords(Array.from({ length: 10 }, (_, i) => ({ id: i, locationName: `cancel-${i}` })), '', () => updates++, { signal: controller.signal });
  controller.abort(); await promise;
  assert.equal(count, 2); assert.equal(updates, 1);
});
