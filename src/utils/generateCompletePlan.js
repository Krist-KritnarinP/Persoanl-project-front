// Continue server-side batches automatically; retry only explicitly temporary quota waits.
export async function generateCompletePlan({
  request,
  post,
  signal,
  onProgress,
  wait = abortableWait,
}) {
  let previousDays = 0;
  let retries = 0;
  while (!signal.aborted) {
    let data;
    try {
      const response = await post("/planner/draft", request, {
        timeout: 45000,
        signal,
      });
      data = response.data.data;
      retries = 0;
    } catch (error) {
      const seconds = error.response?.data?.retryAfterSeconds;
      if (
        error.response?.status !== 429 ||
        !Number.isInteger(seconds) ||
        seconds < 1 ||
        seconds > 60 ||
        ++retries > 3
      )
        throw error;
      await wait(seconds * 1000, signal);
      continue;
    }
    if (signal.aborted) return;
    onProgress(data);
    if (data.complete !== false) return data;
    const completed = data.plan.days.length;
    if (completed <= previousDays) throw new Error("Planner made no progress");
    previousDays = completed;
  }
}
function abortableWait(ms, signal) {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, ms);
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
  });
}
