import { useCallback, useEffect, useRef, useState } from "react";
import { FiUsers } from "react-icons/fi";
import mainApi from "@/api/mainApi";

export default function TripInvitations({ t, onAccepted, onCountChange }) {
  const [invitations, setInvitations] = useState([]);
  const [busyTripId, setBusyTripId] = useState(null);
  const [error, setError] = useState(false);

  const requestVersion = useRef(0);
  const invalidateRequests = useCallback(() => { ++requestVersion.current; }, []);
  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const { data } = await mainApi.get("/collaboration/invitations");
      if (version !== requestVersion.current) return;
      setInvitations(Array.isArray(data.data) ? data.data : []);
      setError(false);
    } catch {
      if (version === requestVersion.current) setError(true);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    return () => {
      invalidateRequests();
      clearTimeout(initial);
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, invalidateRequests]);
  useEffect(() => { onCountChange?.(error ? null : invitations.length); }, [error, invitations.length, onCountChange]);

  const respond = async (tripId, accepted) => {
    setBusyTripId(tripId);
    setError(false);
    try {
      await mainApi.put(`/collaboration/invitations/${tripId}`, { accepted });
      invalidateRequests();
      window.dispatchEvent(new Event("trip-invitations-changed"));
      setInvitations((rows) => rows.filter((row) => row.tripId !== tripId));
      if (accepted) onAccepted?.(tripId);
    } catch {
      setError(true);
    } finally {
      setBusyTripId(null);
    }
  };

  if (!invitations.length && !error) return null;
  return (
    <section className="social-surface shrink-0 rounded-3xl p-4 md:p-5 space-y-3" aria-labelledby="trip-invitations-heading">
      <h2 id="trip-invitations-heading" className="font-bold text-lg flex items-center gap-2"><FiUsers />{t("collab.invitations")}</h2>
      {error && <p role="alert" className="text-sm text-error">{t("collab.actionFailed")}</p>}
      {invitations.map(({ tripId, role, trip }) => (
        <article key={tripId} className="rounded-2xl bg-base-100/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{trip.tripName}</h3>
            <p className="text-sm opacity-70">{t("collab.invitedBy", { name: trip.user.username })} · {t(`collab.role.${role}`)}</p>
            {trip.destination && <p className="text-xs opacity-60">{trip.destination}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" className="btn btn-ghost btn-sm" disabled={busyTripId === tripId} onClick={() => respond(tripId, false)}>{t("collab.decline")}</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={busyTripId === tripId} onClick={() => respond(tripId, true)}>{t("collab.accept")}</button>
          </div>
        </article>
      ))}
    </section>
  );
}
