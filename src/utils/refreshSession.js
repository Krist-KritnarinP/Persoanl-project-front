// One refresh per tab; Web Locks also serialize refreshes across tabs.
export function createSessionRefresher({ renew, read, save, lock }) {
  let pending;
  return failedToken => {
    if (!pending) {
      const work = async () => {
        const current = read();
        if (current && current !== failedToken) return current;
        const session = await renew();
        // Logout or another login while the request was in flight must win.
        if (read() !== failedToken) throw new Error('Session changed');
        save(session);
        return session.token;
      };
      pending = Promise.resolve().then(() => lock ? lock(work) : work()).finally(() => { pending = undefined; });
    }
    return pending;
  };
}
