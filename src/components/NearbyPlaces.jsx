import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown, FiMapPin, FiPlus, FiSearch } from "react-icons/fi";
import { useLang } from "@/i18n";
import mainApi from "@/api/mainApi";
import { validCoords } from "@/utils/geocode";

export default function NearbyPlaces({ activity, trip, coordinates, canEdit, onAdded }) {
  const { t, lang, locale } = useLang();
  const id = useId();
  const pending = useRef(null);
  const insertionForm = useRef(null);
  const [radiusKm, setRadius] = useState(2);
  const [category, setCategory] = useState("restaurant");
  const [limit, setLimit] = useState(5);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [dayId, setDayId] = useState(activity.dayId);
  const [position, setPosition] = useState("end");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const latitude = coordinates?.lat ?? activity.latitude;
  const longitude = coordinates?.lng ?? activity.longitude;
  const hasCoords = validCoords(latitude, longitude);
  const targetDay = trip.days.find(day => day.id === Number(dayId));
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (selected) {
      insertionForm.current?.scrollIntoView({ block: "nearest" });
      insertionForm.current?.querySelector("select")?.focus({ preventScroll: true });
    }
  }, [selected]);
  const resetSearch = () => {
    pending.current?.abort(); pending.current = null;
    setResult(null); setBusy(false); setError(""); setSelected(null); setSaved(false);
  };
  const search = async () => {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError(""); setResult(null); setSelected(null); setSaved(false);
    try {
      const response = await mainApi.post(`/activities/${activity.id}/nearby`, { radiusKm, category, limit, language:lang, ...(hasCoords ? {latitude:Number(latitude),longitude:Number(longitude)} : {}) }, {signal:controller.signal});
      if (pending.current === controller) setResult(response.data.data);
    } catch (e) {
      if (!controller.signal.aborted) setError(t(e.response?.status === 422 ? "nearby.noCoords" : "nearby.error"));
    } finally {
      if (pending.current === controller) { setBusy(false); pending.current=null; }
    }
  };
  const add = async (event) => {
    event.preventDefault();
    if (saving || !selected || !targetDay) return;
    setSaving(true); setError("");
    const [placement, anchor] = position.split(":");
    try {
      await mainApi.post(`/activities/${activity.id}/nearby/add`, {dayId:Number(dayId),placement,anchorActivityId:anchor?Number(anchor):null,place:{name:selected.name,latitude:selected.latitude,longitude:selected.longitude,category:selected.category}});
      setSelected(null); setSaved(true);
      await onAdded();
    } catch { setError(t("nearby.saveError")); }
    finally { setSaving(false); }
  };
  return (
    <details className="nearby-places rounded-b-2xl border border-base-content/10 bg-base-100 mx-2" onToggle={e => {
      if (!e.currentTarget.open && pending.current) { pending.current.abort(); pending.current=null; setBusy(false); }
    }}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-3 text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-b-xl">
        <FiMapPin aria-hidden="true" className="shrink-0" /><span className="flex-1 min-w-0">{t("nearby.open")}</span><FiChevronDown aria-hidden="true" className="shrink-0" />
      </summary>
      <div className="p-3 sm:p-4 pt-0 space-y-4 min-w-0">
        <p className="text-sm text-base-content/70">{t("nearby.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="min-w-0"><label htmlFor={`${id}-radius`} className="block text-xs font-semibold mb-1">{t("nearby.radius")}</label>
            <select id={`${id}-radius`} className="select select-bordered w-full" disabled={saving} value={radiusKm} onChange={e=>{resetSearch();setRadius(Number(e.target.value));}}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} km</option>)}</select></div>
          <div className="min-w-0"><label htmlFor={`${id}-category`} className="block text-xs font-semibold mb-1">{t("nearby.category")}</label>
            <select id={`${id}-category`} className="select select-bordered w-full" disabled={saving} value={category} onChange={e=>{resetSearch();setCategory(e.target.value);}}>{["restaurant","attraction","park","hotel"].map(code=><option value={code} key={code}>{t(`nearby.${code}`)}</option>)}</select></div>
          <div className="min-w-0"><label htmlFor={`${id}-count`} className="block text-xs font-semibold mb-1">{t("nearby.count")}</label>
            <select id={`${id}-count`} className="select select-bordered w-full" disabled={saving} value={limit} onChange={e=>{resetSearch();setLimit(Number(e.target.value));}}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n}</option>)}</select></div>
        </div>
        {!hasCoords && <p className="text-sm text-base-content/70">{t("nearby.noCoords")}</p>}
        <button className="btn btn-primary btn-sm w-full sm:w-auto" type="button" onClick={search} disabled={busy||saving||!hasCoords}>
          {busy ? <span className="loading loading-spinner loading-xs" aria-hidden="true" /> : <FiSearch aria-hidden="true" />}{t(busy?"nearby.loading":"nearby.search")}
        </button>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        {saved && <p role="status" className="text-sm text-success">{t("nearby.saved")}</p>}
        {result && <>
          <p className="text-xs text-base-content/70">{t(result.provider === "google" ? "nearby.googleNote" : "nearby.osmNote")}</p>
          {result.places.length === 0 && <p role="status" className="text-sm text-base-content/70">{t("nearby.empty")}</p>}
          <ul className="space-y-2">
            {result.places.map(place => <li key={place.id} className="rounded-xl border border-base-content/10 bg-base-200/40 p-3 space-y-2">
              <h5 className="font-semibold break-words [overflow-wrap:anywhere]">{place.name}</h5>
              <p className="text-xs text-base-content/70">{t("nearby.distance",{distance:new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(place.distanceMeters/1000)})}</p>
              {place.address && <p className="text-xs break-words text-base-content/70">{place.address}</p>}
              {place.rating != null && <p className="text-xs">★ {place.rating} · {t("nearby.reviews",{count:new Intl.NumberFormat(locale).format(place.reviewCount||0)})}</p>}
              <div className="flex flex-wrap gap-2">
                <a className="btn btn-ghost btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.latitude},${place.longitude}`)}${result.provider==="google"?`&query_place_id=${encodeURIComponent(place.id)}`:""}`} target="_blank" rel="noopener noreferrer">{t("nearby.maps")}</a>
                {canEdit && <button type="button" className="btn btn-outline btn-sm" disabled={saving} onClick={()=>{setSelected(place);setDayId(activity.dayId);setPosition("end");setError("");setSaved(false);}}><FiPlus aria-hidden="true" />{t("nearby.add")}</button>}
              </div>
            </li>)}
          </ul>
          <p className="text-xs"><a href={result.provider==="google"?"https://maps.google.com":"https://www.openstreetmap.org/copyright"} target="_blank" rel="noopener noreferrer" className="underline">{result.provider==="google"?"Google Maps":"© OpenStreetMap contributors"}</a></p>
          {!canEdit && <p className="text-xs text-base-content/70">{t("nearby.viewer")}</p>}
        </>}
        {selected && <form ref={insertionForm} onSubmit={add} className="border border-primary/30 rounded-xl p-3 space-y-3 bg-primary/5">
          <h5 className="font-semibold">{t("nearby.choose")} <span className="block text-sm font-normal break-words">{selected.name}</span></h5>
          <div><label htmlFor={`${id}-day`} className="block text-sm mb-1">{t("nearby.day")}</label>
            <select id={`${id}-day`} className="select select-bordered w-full" disabled={saving} value={dayId} onChange={e=>{setDayId(Number(e.target.value));setPosition("end");}}>{trip.days.map(day=><option key={day.id} value={day.id}>{t("planner.day",{count:day.dayCount})}{day.dayDate?` · ${day.dayDate.slice(0,10)}`:""}</option>)}</select></div>
          <div><label htmlFor={`${id}-position`} className="block text-sm mb-1">{t("nearby.position")}</label>
            <select id={`${id}-position`} className="select select-bordered w-full" disabled={saving} value={position} onChange={e=>setPosition(e.target.value)}>
              <option value="end">{t("nearby.end")}</option>
              {(targetDay?.activities||[]).flatMap(a=>[<option key={`before:${a.id}`} value={`before:${a.id}`}>{t("nearby.before",{name:a.locationName})}</option>,<option key={`after:${a.id}`} value={`after:${a.id}`}>{t("nearby.after",{name:a.locationName})}</option>])}
            </select></div>
          <div className="flex flex-wrap gap-2"><button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{t(saving?"nearby.saving":"nearby.add")}</button><button type="button" className="btn btn-ghost btn-sm" disabled={saving} onClick={()=>setSelected(null)}>{t("common.cancel")}</button></div>
        </form>}
      </div>
    </details>
  );
}
