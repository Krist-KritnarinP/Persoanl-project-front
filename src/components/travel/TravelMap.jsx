import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/i18n";
import { travelStatus } from "@/utils/travelOverview";
const colors = {
  past: "#2563eb",
  ongoing: "#b45309",
  upcoming: "#7c3aed",
  undated: "#64748b",
};
function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length)
      map.fitBounds(
        points.map((p) => [p.lat, p.lng]),
        { padding: [25, 25], maxZoom: 10, animate: false },
      );
  }, [map, points]);
  return null;
}
export default function TravelMap({ trips, preview = false }) {
  const { t } = useLang();
  const points = useMemo(
    () =>
      trips.flatMap((trip) =>
        trip.points.map((p) => ({
          ...p,
          tripId: trip.id,
          tripName: trip.tripName,
          status: travelStatus(p.date, p.date),
        })),
      ),
    [trips],
  );
  return (
    <div
      className="relative isolate rounded-2xl overflow-hidden border border-base-content/15"
      data-testid="travel-map"
    >
      <MapContainer
        center={[25, 20]}
        zoom={1}
        scrollWheelZoom={false}
        dragging={!preview}
        zoomControl={!preview}
        style={{ height: preview ? 180 : 360, width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit points={points} />
        {points.map((p) => (
          <CircleMarker
            key={`${p.tripId}-${p.id}`}
            center={[p.lat, p.lng]}
            radius={preview ? 4 : 7}
            pathOptions={{
              color: colors[p.status],
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.tripName}
              <br />
              {t(`travel.${p.status}`)}
              {p.date && ` · ${p.date.slice(0, 10)}`}
              <br />
              <Link to={`/trips/${p.tripId}`}>{t("dash.viewTrip")}</Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {!points.length && (
        <p className="absolute bottom-3 left-3 right-3 bg-base-100 p-3 rounded-xl text-sm shadow">
          {t("travel.noPins")}
        </p>
      )}
    </div>
  );
}
