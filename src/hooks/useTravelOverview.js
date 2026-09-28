import { useEffect, useState } from "react";
import { mainApi } from "@/api/mainApi";
export default function useTravelOverview() {
  const [state, setState] = useState({
    trips: [],
    loading: true,
    error: false,
  });
  const [attempt, retry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const trips = [];
        let page = 1;
        do {
          const response = await mainApi.get("/trips/overview", {
            params: { page },
            signal: controller.signal,
          });
          trips.push(...response.data.data);
          page = response.data.nextPage;
        } while (page && !controller.signal.aborted);
        if (!controller.signal.aborted)
          setState({ trips, loading: false, error: false });
      } catch {
        if (!controller.signal.aborted)
          setState({ trips: [], loading: false, error: true });
      }
    }
    load();
    return () => controller.abort();
  }, [attempt]);
  return {
    ...state,
    retry: () => {
      setState({ trips: [], loading: true, error: false });
      retry((n) => n + 1);
    },
  };
}
