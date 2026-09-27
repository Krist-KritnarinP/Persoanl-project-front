import test from "node:test";
import assert from "node:assert/strict";
import { generateCompletePlan } from "../src/utils/generateCompletePlan.js";
test("one action completes batches and waits for temporary quota automatically", async () => {
  let calls = 0;
  const progress = [],
    waits = [];
  const result = await generateCompletePlan({
    request: {},
    signal: new AbortController().signal,
    onProgress: (d) => progress.push(d.plan.days.length),
    wait: async (ms) => waits.push(ms),
    post: async () => {
      calls++;
      if (calls === 2)
        throw { response: { status: 429, data: { retryAfterSeconds: 5 } } };
      return {
        data: {
          data: {
            complete: calls === 3,
            plan: { days: Array(calls === 3 ? 21 : 7) },
          },
        },
      };
    },
  });
  assert.equal(result.complete, true);
  assert.deepEqual(progress, [7, 21]);
  assert.deepEqual(waits, [5000]);
});
test("daily quota stops without automatic charges; cancellation prevents another batch", async () => {
  let calls = 0;
  const controller = new AbortController();
  await assert.rejects(
    generateCompletePlan({
      request: {},
      signal: controller.signal,
      onProgress: () => {},
      post: async () => {
        calls++;
        throw { response: { status: 429, data: {} } };
      },
    }),
  );
  assert.equal(calls, 1);
  await generateCompletePlan({
    request: {},
    signal: controller.signal,
    onProgress: () => controller.abort(),
    post: async () => ({
      data: { data: { complete: false, plan: { days: [{}] } } },
    }),
  });
  assert.equal(controller.signal.aborted, true);
});
