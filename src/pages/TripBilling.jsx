import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import { mainApi } from "@/api/mainApi";
import { useLang } from "@/i18n";
import BillForm from "@/components/billing/BillForm";
import { Field, MoneyInput } from "@/components/billing/SplitEditor";
import { moneyText } from "@/utils/billing";
import { localToday } from "@/utils/travelOverview";
export default function TripBilling() {
  const { tripId } = useParams();
  return <BillingWorkspace key={tripId} tripId={tripId} />;
}
function BillingWorkspace({ tripId }) {
  const { sidebarEnabled } = useOutletContext();
  const { t, locale } = useLang();
  const [data, setData] = useState(null),
    [trip, setTrip] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(null),
    [name, setName] = useState("");
  const [person, setPerson] = useState(""),
    [date, setDate] = useState(""),
    [status, setStatus] = useState("all");
  const [repay, setRepay] = useState({
    fromId: "",
    toId: "",
    amount: "",
    date: localToday(),
    billIds: [],
  });
  const pending = useRef(null),
    sending = useRef(false);
  const load = useCallback(
    async (signal) => {
      const [ledger, details] = await Promise.all([
        mainApi.get(`/trips/${tripId}/billing`, { signal }),
        mainApi.get(`/trips/${tripId}`, { signal }),
      ]);
      setData(ledger.data.data);
      setTrip(details.data.data);
    },
    [tripId],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch(() => {
      if (!controller.signal.aborted) setError("bill.loadError");
    });
    return () => controller.abort();
  }, [load]);
  const command = async (payload) => {
    if (sending.current) return false;
    sending.current = true;
    setBusy(true);
    setError("");
    const serialized = JSON.stringify(payload);
    if (pending.current?.serialized !== serialized)
      pending.current = { serialized, requestId: crypto.randomUUID() };
    try {
      await mainApi.post(`/trips/${tripId}/billing`, {
        ...payload,
        requestId: pending.current.requestId,
      });
      await load();
      pending.current = null;
      return true;
    } catch (e) {
      setError(
        e.response?.status === 409
          ? "bill.conflict"
          : e.response?.status === 400
            ? "bill.invalid"
            : "bill.saveError",
      );
      return false;
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  const confirmed = (payload) =>
    window.confirm(t("bill.confirmAction"))
      ? command(payload)
      : Promise.resolve(false);
  if (!data)
    return (
      <main className="p-6">
        {error ? (
          <div role="alert">
            {t(error)}{" "}
            <button
              className="btn"
              onClick={() => {
                setError("");
                load().catch(() => setError("bill.loadError"));
              }}
            >
              {t("travel.retry")}
            </button>
          </div>
        ) : (
          <span className="loading loading-spinner" />
        )}
      </main>
    );
  const names = Object.fromEntries(data.members.map((m) => [m.id, m.name]));
  const choices = data.summary.debts.filter(
    (d) =>
      d.fromId === repay.fromId && d.toId === repay.toId && d.remaining > 0,
  );
  const owed = choices
    .filter((d) => repay.billIds.includes(d.billId))
    .reduce((n, d) => n + d.remaining, 0);
  const activities = (trip?.days || []).flatMap((day) =>
    (day.activities || []).map((a) => ({ ...a, dayDate: day.dayDate })),
  );
  const filtered = data.bills.filter(
    (b) =>
      (status === "all" || (status === "void" ? b.voided : !b.voided)) &&
      (!date || b.date === date) &&
      (!person ||
        b.data.shares[person] !== undefined ||
        b.data.payments[person] !== undefined),
  );
  return (
    <main className="billing-workspace w-full p-4 md:p-8 space-y-6">
      {!sidebarEnabled && (
        <div className="flex justify-end gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      )}
      <Link className="btn btn-ghost" to={`/trips/${tripId}`}>
        ← {t("bill.back")}
      </Link>
      <h1 className="text-3xl font-bold">
        {t("bill.heading")} · {trip?.tripName}
      </h1>
      <p className="text-base-content/70">{t("bill.notice")}</p>
      <nav aria-label={t("bill.quickNav")} className="flex flex-wrap gap-2">
        {[
          ["members", "bill.members"],
          ["bills", "bill.list"],
          ["repay", "bill.repay"],
        ].map(([id, key]) => (
          <a
            key={id}
            href={`#billing-${id}`}
            className="btn btn-sm btn-outline"
          >
            {t(key)}
          </a>
        ))}
      </nav>
      {error && (
        <p role="alert" className="alert alert-error">
          {t(error)}
        </p>
      )}
      <section className="grid sm:grid-cols-2 gap-3">
        <div className="bg-base-100 rounded-xl p-5">
          <p>{t("bill.confirmedTotal")}</p>
          <strong className="text-2xl">฿{moneyText(data.summary.total)}</strong>
        </div>
        <div className="bg-base-100 rounded-xl p-5">
          <p>{t("bill.outstanding")}</p>
          <strong className="text-2xl">
            ฿
            {moneyText(data.summary.debts.reduce((n, d) => n + d.remaining, 0))}
          </strong>
        </div>
      </section>
      <section id="billing-members" className="space-y-3">
        <h2 className="text-xl font-bold">{t("bill.members")}</h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await command({
                action: "member.add",
                member: { name, active: true },
              })
            )
              setName("");
          }}
        >
          <input
            aria-label={t("bill.memberName")}
            className="input"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("bill.memberName")}
          />
          <button className="btn btn-outline" disabled={busy}>
            {t("bill.addMember")}
          </button>
        </form>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {data.summary.members.map((m) => (
            <article
              key={m.id}
              className="bg-base-100 border border-base-content/10 rounded-xl p-4 space-y-1"
            >
              <h3 className="font-bold">
                {m.name}
                {!m.active && ` · ${t("bill.archived")}`}
              </h3>
              <p>
                {t("bill.paid")}: ฿{moneyText(m.paid)} · {t("bill.share")}: ฿
                {moneyText(m.share)}
              </p>
              <p>
                {t("bill.sent")}: ฿{moneyText(m.sent)} · {t("bill.received")}: ฿
                {moneyText(m.received)}
              </p>
              <p>
                {t("bill.owed")}: ฿{moneyText(m.owed)} · {t("bill.receivable")}:
                ฿{moneyText(m.receivable)}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-xs btn-ghost"
                  disabled={busy}
                  onClick={() => {
                    const next = window.prompt(t("bill.memberName"), m.name);
                    if (next?.trim())
                      command({
                        action: "member.update",
                        id: m.id,
                        version: m.version,
                        member: { name: next.trim(), active: m.active },
                      });
                  }}
                >
                  {t("bill.edit")}
                </button>
                <button
                  disabled={busy}
                  className="btn btn-xs btn-ghost"
                  onClick={() =>
                    confirmed({
                      action: "member.update",
                      id: m.id,
                      version: m.version,
                      member: { name: m.name, active: !m.active },
                    })
                  }
                >
                  {t(m.active ? "bill.archive" : "bill.restore")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <button
        className="btn btn-primary"
        disabled={!data.members.some((m) => m.active) || !!editing}
        onClick={() => setEditing({})}
      >
        {t("bill.new")}
      </button>
      {editing && (
        <BillForm
          key={editing.id || "new"}
          tripId={tripId}
          members={data.members}
          activities={activities}
          editing={editing.id ? editing : null}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={async (bill) => {
            if (
              await confirmed({
                action: "bill.save",
                ...(editing.id
                  ? { id: editing.id, version: editing.version }
                  : {}),
                bill,
              })
            )
              setEditing(null);
          }}
        />
      )}
      <section id="billing-bills" className="space-y-3">
        <h2 className="text-xl font-bold">{t("bill.list")}</h2>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={t("bill.filterPerson")}
            className="select"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            <option value="">{t("bill.allMembers")}</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            aria-label={t("bill.date")}
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            aria-label={t("bill.status")}
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["all", "posted", "void"].map((v) => (
              <option key={v} value={v}>
                {t("bill." + v)}
              </option>
            ))}
          </select>
        </div>
        {!filtered.length && <p>{t("bill.empty")}</p>}
        {filtered.map((b) => {
          const locked = data.settlements.some(
            (s) => !s.reversed && s.allocations.some((a) => a.billId === b.id),
          );
          return (
            <details
              key={b.id}
              className="bg-base-100 border border-base-content/10 rounded-xl p-4"
            >
              <summary className="cursor-pointer font-semibold">
                {b.date} · {b.title} · ฿{moneyText(b.total)} ·{" "}
                {t(b.voided ? "bill.void" : "bill.posted")}
              </summary>
              <div className="pt-4 space-y-2">
                <p>
                  {t("bill.version")}: {b.version}
                </p>
                {b.data.lines.map((l, i) => (
                  <p key={i}>
                    {l.name}: ฿{moneyText(l.total)}
                  </p>
                ))}
                {b.data.charges.map((c) => (
                  <p key={c.kind}>
                    {t("bill." + c.kind)}: ฿{moneyText(c.total)} ·{" "}
                    {t(c.included ? "bill.included" : "bill.added")}
                  </p>
                ))}
                {Object.entries(b.data.payments).map(([id, n]) => (
                  <p key={"p" + id}>
                    {names[id]} · {t("bill.paid")}: ฿{moneyText(n)}
                  </p>
                ))}
                {Object.entries(b.data.shares).map(([id, n]) => (
                  <p key={id}>
                    {names[id]} · {t("bill.share")}: ฿{moneyText(n)}
                  </p>
                ))}
                {data.summary.debts
                  .filter((d) => d.billId === b.id)
                  .map((d) => (
                    <p key={d.fromId + d.toId}>
                      {names[d.fromId]} → {names[d.toId]}:{" "}
                      {t("bill.outstanding")} ฿{moneyText(d.remaining)} / ฿
                      {moneyText(d.amount)}
                    </p>
                  ))}
                {locked && (
                  <p className="text-sm text-warning">{t("bill.locked")}</p>
                )}
                <div className="flex gap-2">
                  <button
                    disabled={busy || b.voided || locked || !!editing}
                    className="btn btn-sm"
                    onClick={() => setEditing(b)}
                  >
                    {t("bill.edit")}
                  </button>
                  <button
                    disabled={busy || b.voided || locked}
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      confirmed({
                        action: "bill.void",
                        id: b.id,
                        version: b.version,
                      })
                    }
                  >
                    {t("bill.voidAction")}
                  </button>
                </div>
              </div>
            </details>
          );
        })}
      </section>
      <section
        id="billing-repay"
        className="bg-base-100 rounded-2xl p-4 space-y-4"
      >
        <h2 className="text-xl font-bold">{t("bill.repay")}</h2>
        <p className="text-sm">{t("bill.repayNote")}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {["fromId", "toId"].map((key) => (
            <Field
              key={key}
              label={t(key === "fromId" ? "bill.from" : "bill.to")}
            >
              <select
                className="select w-full"
                value={repay[key]}
                onChange={(e) =>
                  setRepay({ ...repay, [key]: e.target.value, billIds: [] })
                }
              >
                <option value="">—</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          ))}
        </div>
        {choices.map((d) => (
          <label key={d.billId} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={repay.billIds.includes(d.billId)}
              onChange={(e) =>
                setRepay({
                  ...repay,
                  billIds: e.target.checked
                    ? [...repay.billIds, d.billId]
                    : repay.billIds.filter((id) => id !== d.billId),
                })
              }
            />
            {d.title} · ฿{moneyText(d.remaining)}
          </label>
        ))}
        <button
          className="btn btn-sm btn-ghost"
          onClick={() =>
            setRepay({ ...repay, billIds: choices.map((d) => d.billId) })
          }
        >
          {t("bill.selectAll")}
        </button>
        <p>
          {t("bill.selectedDebt")}: ฿{moneyText(owed)}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t("bill.repayAmount")}>
            <MoneyInput
              value={repay.amount}
              onChange={(e) => setRepay({ ...repay, amount: e.target.value })}
            />
          </Field>
          <Field label={t("bill.date")}>
            <input
              type="date"
              className="input w-full"
              value={repay.date}
              onChange={(e) => setRepay({ ...repay, date: e.target.value })}
            />
          </Field>
        </div>
        <p>
          {t("bill.remaining")}: ฿
          {moneyText(
            Math.max(0, owed - Math.round(Number(repay.amount || 0) * 100)),
          )}
        </p>
        <button
          className="btn btn-primary"
          disabled={
            busy ||
            !owed ||
            Number(repay.amount) <= 0 ||
            Number(repay.amount) * 100 > owed
          }
          onClick={async () => {
            if (
              await confirmed({ action: "settlement.add", settlement: repay })
            )
              setRepay({ ...repay, amount: "", billIds: [] });
          }}
        >
          {t("bill.recordRepayment")}
        </button>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("bill.repaymentHistory")}</h2>
        {data.settlements.map((s) => (
          <article key={s.id} className="bg-base-100 rounded-xl p-4 space-y-2">
            <p>
              {s.date} · {names[s.fromId]} → {names[s.toId]} · ฿
              {moneyText(s.amount)} {s.reversed && `(${t("bill.reversed")})`}
            </p>
            {s.allocations.map((a) => (
              <p className="text-sm" key={a.billId}>
                {data.bills.find((b) => b.id === a.billId)?.title}: ฿
                {moneyText(a.amount)}
              </p>
            ))}
            <button
              className="btn btn-sm btn-outline"
              disabled={busy || s.reversed}
              onClick={() =>
                confirmed({
                  action: "settlement.reverse",
                  id: s.id,
                  version: s.version,
                })
              }
            >
              {t("bill.reverse")}
            </button>
          </article>
        ))}
      </section>
      <details className="bg-base-100 rounded-xl p-4">
        <summary>{t("bill.history")}</summary>
        {data.history.map((event) => (
          <p className="text-sm py-2" key={event.id}>
            {new Date(event.createdAt).toLocaleString(locale)} ·{" "}
            {t("bill.event." + event.action)} ·{" "}
            {event.result.title ||
              event.result.name ||
              names[event.result.fromId] ||
              ""}
            {event.before?.total !== undefined
              ? ` · ฿${moneyText(event.before.total)} → ฿${moneyText(event.result.total)}`
              : ""}
          </p>
        ))}
      </details>
    </main>
  );
}
