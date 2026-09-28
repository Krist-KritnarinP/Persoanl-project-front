import { useOutletContext } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useLang } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mainApi } from "@/api/mainApi";
import { generateCompletePlan } from "@/utils/generateCompletePlan";

const types = {
  ATTRACTION: "planner.typeAttraction",
  RESTAURANT: "planner.typeRestaurant",
  TRANSPORT: "planner.typeTransport",
  ACCOMMODATION: "planner.typeAccommodation",
};

const rangeDays = (start, end) =>
  (Date.parse(end) - Date.parse(start)) / 86400000 + 1;

function requestError(error, saving = false) {
  const status = error.response?.status;
  if (status === 429) return "planner.quota";
  if (status === 400) return "planner.invalid";
  if (status === 404) return "planner.missing";
  return saving ? "planner.saveUnknown" : "planner.failed";
}

export default function AiPlanner() {
  const { sidebarEnabled } = useOutletContext();
  const navigate = useNavigate();
  const { t, lang, locale } = useLang();
  const money = (value) =>
    Number(value).toLocaleString(locale, { maximumFractionDigits: 2 });
  const [request, setRequest] = useState({
    requirements: "",
    startDate: "",
    endDate: "",
  });
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const inFlight = useRef(false);
  const submittedPlan = useRef(null);
  const generation = useRef(null);
  useEffect(() => () => generation.current?.abort(), []);
  const days = rangeDays(request.startDate, request.endDate);
  const total =
    draft?.plan.days.reduce(
      (sum, day) =>
        sum + day.activities.reduce((s, a) => s + Number(a.price || 0), 0),
      0,
    ) || 0;

  async function generate(event) {
    event?.preventDefault();
    if (inFlight.current) return;
    if (!Number.isInteger(days) || days < 1) {
      setError("planner.dateError");
      return;
    }
    inFlight.current = true;
    setBusy("draft");
    setError("");
    try {
      generation.current = new AbortController();
      await generateCompletePlan({
        request: { ...request, language: draft?.request?.language || lang },
        post: mainApi.post.bind(mainApi),
        signal: generation.current.signal,
        onProgress: setDraft,
      });
      submittedPlan.current = null;
      setUncertain(false);
    } catch (err) {
      if (!generation.current?.signal.aborted) setError(requestError(err));
    } finally {
      inFlight.current = false;
      setBusy("");
    }
  }

  function editActivity(dayIndex, activityIndex, field, value) {
    setDraft((old) => ({
      ...old,
      plan: {
        ...old.plan,
        days: old.plan.days.map((day, i) =>
          i !== dayIndex
            ? day
            : {
                ...day,
                activities: day.activities.map((a, j) =>
                  j === activityIndex ? { ...a, [field]: value } : a,
                ),
              },
        ),
      },
    }));
  }

  async function save(event) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy("save");
    setError("");
    submittedPlan.current ??= draft.plan;
    try {
      const response = await mainApi.post(
        `/planner/${draft.draftId}/confirm`,
        { plan: submittedPlan.current },
        { timeout: 30000 },
      );
      navigate(`/trips/${response.data.data.id}`);
    } catch (err) {
      // On a lost response the server may already have committed. Keep the same payload for retries.
      const unknown = !err.response || err.response.status >= 500;
      setUncertain(unknown);
      if (!unknown) submittedPlan.current = null;
      setError(requestError(err, true));
    } finally {
      inFlight.current = false;
      setBusy("");
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:py-10 text-base-content">
      <div className="w-full space-y-6">
        {!sidebarEnabled && (
          <header className="flex items-center justify-between gap-3">
            <Link to="/dashboard" className="btn btn-ghost rounded-full">
              {t("planner.back")}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
        )}
        <section className="space-y-3">
          <span className="badge badge-outline">{t("planner.badge")}</span>
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("planner.title")}
          </h1>
          <p className="text-base-content/75 text-lg">
            {t("planner.subtitle")}
          </p>
          <ol
            className="flex flex-wrap gap-3 text-sm"
            aria-label={t("planner.steps")}
          >
            <li className={!draft ? "font-bold" : ""}>{t("planner.step1")}</li>
            <li className={draft ? "font-bold" : ""}>{t("planner.step2")}</li>
            <li>{t("planner.step3")}</li>
          </ol>
        </section>

        {error && (
          <div role="alert" className="alert alert-error break-words">
            {t(error)}
          </div>
        )}
        {!draft ? (
          <form
            onSubmit={generate}
            className="bg-base-100 border border-base-content/15 rounded-3xl p-5 md:p-8 shadow-sm space-y-5"
          >
            <fieldset disabled={!!busy} className="space-y-5">
              <label className="block space-y-2">
                <span className="font-semibold text-lg">
                  {t("planner.requirements")}
                </span>
                <textarea
                  className="textarea w-full text-base min-h-40 rounded-none px-4 py-3 leading-relaxed"
                  style={{ borderRadius: 0, lineHeight: 1.75 }}
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder={t("planner.placeholder")}
                  value={request.requirements}
                  onChange={(e) =>
                    setRequest({ ...request, requirements: e.target.value })
                  }
                />
                <span className="block text-sm text-base-content/70">
                  {t("planner.help")}
                </span>
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="font-semibold">{t("planner.start")}</span>
                  <input
                    type="date"
                    className="input w-full"
                    required
                    min="2000-01-01"
                    max="2099-12-31"
                    value={request.startDate}
                    onChange={(e) =>
                      setRequest({ ...request, startDate: e.target.value })
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-semibold">{t("planner.end")}</span>
                  <input
                    type="date"
                    className="input w-full"
                    required
                    min={request.startDate || "2000-01-01"}
                    max="2099-12-31"
                    value={request.endDate}
                    onChange={(e) =>
                      setRequest({ ...request, endDate: e.target.value })
                    }
                  />
                </label>
              </div>
              <p className="text-sm text-base-content/70">
                {t("planner.noCap")}
                {Number.isInteger(days) && days > 0
                  ? ` · ${t("planner.selected", { count: days })}`
                  : ""}
              </p>
              <p role="note" className="text-sm text-base-content/70">
                {t("planner.notice")}
              </p>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto rounded-full px-8"
              >
                {busy ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />{" "}
                    {t("planner.generating")}
                  </>
                ) : (
                  t("planner.generate")
                )}
              </button>
            </fieldset>
            <p className="text-sm text-base-content/70" role="status">
              {busy ? t("planner.wait") : t("planner.consent")}
            </p>
          </form>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <div className="bg-base-100 border border-base-content/15 rounded-3xl p-5 space-y-3">
              <h2 className="text-2xl font-bold">{t("planner.review")}</h2>
              <p>
                {request.startDate} → {request.endDate} ·{" "}
                {draft.plan.days.length} {t("planner.days")}
              </p>
              <p role="status">
                {draft.complete === false
                  ? t("planner.planning")
                  : t("planner.complete")}{" "}
                {draft.plan.days.length} / {draft.totalDays || days}{" "}
                {t("planner.days")}
              </p>
              {draft.complete === false && !busy && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => generate()}
                >
                  {t("planner.resume")}
                </button>
              )}
              <p className="font-semibold text-lg">
                {t("planner.budget", { amount: money(total) })}
              </p>
              <p className="text-sm text-base-content/75">
                {t("planner.disclaimer")}
              </p>
              {draft.plan.assumptions.length > 0 && (
                <div>
                  <h3 className="font-bold">{t("planner.assumptions")}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {draft.plan.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <fieldset
              disabled={!!busy || uncertain || draft.complete === false}
              className="space-y-5"
            >
              <label className="block space-y-2">
                <span className="font-semibold">{t("planner.tripName")}</span>
                <input
                  className="input w-full"
                  required
                  maxLength={100}
                  value={draft.plan.tripName}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      plan: { ...draft.plan, tripName: e.target.value },
                    })
                  }
                />
              </label>
              {draft.plan.days.map((day, di) => (
                <section
                  key={day.date}
                  className="bg-base-100 border border-base-content/15 rounded-3xl p-4 md:p-6 space-y-4"
                >
                  <h3 className="text-xl font-bold">
                    {t("planner.day", { count: di + 1 })} · {day.date}
                  </h3>
                  <p className="text-base-content/75">{day.description}</p>
                  {day.activities.map((a, ai) => (
                    <div
                      key={ai}
                      className="border border-base-content/15 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="badge badge-ghost">
                          {t(types[a.activityType])}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          aria-label={`${t("planner.remove")} ${a.locationName}`}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              plan: {
                                ...draft.plan,
                                days: draft.plan.days.map((d, i) =>
                                  i !== di
                                    ? d
                                    : {
                                        ...d,
                                        activities: d.activities.filter(
                                          (_, j) => j !== ai,
                                        ),
                                      },
                                ),
                              },
                            })
                          }
                        >
                          {t("planner.remove")}
                        </button>
                      </div>
                      <label className="block space-y-1">
                        <span>{t("planner.place")}</span>
                        <input
                          className="input w-full"
                          required
                          maxLength={150}
                          value={a.locationName}
                          onChange={(e) =>
                            editActivity(di, ai, "locationName", e.target.value)
                          }
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block space-y-1">
                          <span>{t("planner.time")}</span>
                          <input
                            type="time"
                            className="input w-full"
                            required
                            value={a.time}
                            onChange={(e) =>
                              editActivity(di, ai, "time", e.target.value)
                            }
                          />
                        </label>
                        <label className="block space-y-1">
                          <span>{t("planner.price")}</span>
                          <input
                            type="number"
                            className="input w-full"
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            required
                            value={a.price}
                            onChange={(e) =>
                              editActivity(
                                di,
                                ai,
                                "price",
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </label>
                      </div>
                      <label className="block space-y-1">
                        <span>{t("planner.details")}</span>
                        <textarea
                          className="textarea w-full text-base"
                          maxLength={500}
                          value={a.description}
                          onChange={(e) =>
                            editActivity(di, ai, "description", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  ))}
                  {!day.activities.length && <p>{t("planner.emptyDay")}</p>}
                </section>
              ))}
            </fieldset>
            <div className="flex flex-wrap gap-3 pb-8">
              <button
                type="submit"
                className="btn btn-primary rounded-full"
                disabled={!!busy || draft.complete === false}
              >
                {busy === "save"
                  ? t("planner.saving")
                  : uncertain
                    ? t("planner.retrySave")
                    : t("planner.save")}
              </button>
              <button
                type="button"
                className="btn btn-outline rounded-full"
                disabled={!!busy || uncertain}
                onClick={() => {
                  setDraft(null);
                  setError("");
                }}
              >
                {t("planner.editRequest")}
              </button>
              <p className="w-full text-sm text-base-content/70">
                {uncertain ? t("planner.locked") : t("planner.unsaved")}
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
