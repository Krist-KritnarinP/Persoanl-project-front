import { useEffect, useMemo, useState } from "react";
import { resolveActivityCoords, validCoords } from "@/utils/geocode";

// Keep live activity metadata separate from coordinate progress to avoid stale popups.
export function useTripCoordinates(trip) {
  const activities = useMemo(
    () =>
      (trip?.days || []).flatMap((day) =>
        (day.activities || []).map((a) => ({
          ...a,
          dayId: day.id,
          dayCount: day.dayCount,
        })),
      ),
    [trip?.days],
  );
  const key = JSON.stringify([
    trip?.id,
    trip?.destination,
    activities.map((a) => [a.id, a.locationName, a.latitude, a.longitude]),
  ]);
  const [state, setState] = useState({ key: null, points: [], loading: false });
  useEffect(() => {
    const controller = new AbortController();
    // Coalesce progress so a large trip does not re-render the entire page per pin.
    let timer;
    let latest;
    const publish = (points) => {
      latest = points;
      if (!timer)
        timer = setTimeout(() => {
          timer = null;
          if (!controller.signal.aborted)
            setState({ key, points: latest, loading: true });
        }, 80);
    };
    // DB pins appear on the first render even while missing places resolve.
    const immediate = activities.map((a) => ({
      ...a,
      lat: validCoords(a.latitude, a.longitude) ? Number(a.latitude) : null,
      lng: validCoords(a.latitude, a.longitude) ? Number(a.longitude) : null,
    }));
    setState({ key, points: immediate, loading: true });
    resolveActivityCoords(activities, trip?.destination || "", publish, {
      signal: controller.signal,
    }).then((points) => {
      clearTimeout(timer);
      if (!controller.signal.aborted) setState({ key, points, loading: false });
    });
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // key contains only fields that affect geocoding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const geoPoints = useMemo(() => {
    if (state.key !== key) return [];
    const byId = new Map(state.points.map((p) => [p.id, p]));
    return activities.map((a) => ({
      ...a,
      lat: byId.get(a.id)?.lat ?? null,
      lng: byId.get(a.id)?.lng ?? null,
    }));
  }, [activities, key, state]);
  return { geoPoints, geoLoading: state.key !== key || state.loading };
}
