import { useState } from "react";
import { useLang } from "@/i18n";
import { mainApi } from "@/api/mainApi";
import { localToday } from "@/utils/travelOverview";
import SplitEditor, { Field, MoneyInput } from "./SplitEditor";
import { equalSplit, moneyText } from "@/utils/billing";
export default function BillForm({
  tripId,
  members,
  activities,
  editing,
  onSave,
  onCancel,
  busy,
}) {
  const { t } = useLang();
  const [form, setForm] = useState(
    () =>
      editing?.data.input || {
        title: "",
        date: localToday(),
        activityId: null,
        lines: [
          {
            name: "",
            amount: "0",
            split: equalSplit(members.filter((m) => m.active)),
          },
        ],
        charges: [],
        payments: members.some((m) => m.active)
          ? [{ memberId: members.find((m) => m.active).id, amount: "0" }]
          : [],
      },
  );
  const [preview, setPreview] = useState(null),
    [error, setError] = useState(false),
    [loading, setLoading] = useState(false);
  const change = (next) => {
    setForm(next);
    setPreview(null);
    setError(false);
  };
  const line = (i, next) =>
    change({
      ...form,
      lines: form.lines.map((l, index) => (i === index ? next : l)),
    });
  const charge = (kind, next) =>
    change({
      ...form,
      charges: form.charges.map((c) => (c.kind === kind ? next : c)),
    });
  const active = members.filter((m) => m.active);
  const calculate = async () => {
    setLoading(true);
    setError(false);
    try {
      setPreview(
        (await mainApi.post(`/trips/${tripId}/billing/preview`, form)).data
          .data,
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  const importActivity = (id) => {
    const a = activities.find((a) => a.id === Number(id));
    if (!a) return;
    change({
      ...form,
      title: a.locationName,
      date: (a.activityDate || a.dayDate || localToday()).slice(0, 10),
      activityId: a.id,
      lines: [
        {
          name: a.locationName,
          amount: String(a.price || 0),
          split: equalSplit(active),
        },
      ],
      charges: [],
    });
  };
  return (
    <form
      className="bg-base-100 border border-base-content/15 rounded-2xl p-4 md:p-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        calculate();
      }}
    >
      <fieldset disabled={busy || loading} className="space-y-5">
        <h2 className="text-xl font-bold">
          {t(editing ? "bill.edit" : "bill.new")}
        </h2>
        <p className="text-sm text-base-content/70">{t("bill.formNote")}</p>
        <h3 className="font-bold text-lg">{t("bill.stepItems")}</h3>
        <Field label={t("bill.fromActivity")}>
          <select
            className="select w-full"
            value={form.activityId || ""}
            onChange={(e) =>
              e.target.value
                ? importActivity(e.target.value)
                : change({ ...form, activityId: null })
            }
          >
            <option value="">{t("bill.standalone")}</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.locationName}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t("bill.title")}>
            <input
              required
              maxLength={150}
              className="input w-full"
              value={form.title}
              onChange={(e) => change({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label={t("bill.date")}>
            <input
              required
              type="date"
              className="input w-full"
              value={form.date}
              onChange={(e) => change({ ...form, date: e.target.value })}
            />
          </Field>
        </div>
        {form.lines.map((l, i) => (
          <section
            key={i}
            className="border border-base-content/15 rounded-xl p-3 space-y-3"
          >
            <div className="grid sm:grid-cols-[1fr_10rem_auto] gap-2">
              <Field label={t("bill.item")}>
                <input
                  required
                  className="input w-full"
                  maxLength={150}
                  value={l.name}
                  onChange={(e) => line(i, { ...l, name: e.target.value })}
                />
              </Field>
              <Field label={t("bill.amountThb")}>
                <MoneyInput
                  required
                  value={l.amount}
                  onChange={(e) => line(i, { ...l, amount: e.target.value })}
                />
              </Field>
              <button
                type="button"
                className="btn btn-ghost self-end"
                disabled={form.lines.length === 1}
                onClick={() =>
                  change({
                    ...form,
                    lines: form.lines.filter((_, j) => i !== j),
                  })
                }
              >
                {t("common.delete")}
              </button>
            </div>
            <SplitEditor
              value={l.split}
              members={active}
              onChange={(split) => line(i, { ...l, split })}
            />
          </section>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={form.lines.length >= 50}
          onClick={() =>
            change({
              ...form,
              lines: [
                ...form.lines,
                { name: "", amount: "0", split: equalSplit(active) },
              ],
            })
          }
        >
          {t("bill.addItem")}
        </button>
        <h3 className="font-bold text-lg">{t("bill.stepCharges")}</h3>
        <div className="space-y-3">
          {["service", "vat", "tip"].map((kind) => {
            const c = form.charges.find((c) => c.kind === kind);
            return (
              <section
                key={kind}
                className="border border-base-content/15 rounded-xl p-3 space-y-3"
              >
                <label className="flex gap-2 font-semibold items-center">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={!!c}
                    onChange={(e) =>
                      change({
                        ...form,
                        charges: e.target.checked
                          ? [
                              ...form.charges,
                              {
                                kind,
                                type: "amount",
                                value: "0",
                                included: false,
                                base:
                                  kind === "vat"
                                    ? "itemsService"
                                    : kind === "tip"
                                      ? "afterCharges"
                                      : "items",
                                split: { mode: "proportional", parts: [] },
                              },
                            ]
                          : form.charges.filter((c) => c.kind !== kind),
                      })
                    }
                  />
                  {t("bill." + kind)}
                </label>
                {c && (
                  <>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <Field label={t("bill.value")}>
                        <MoneyInput
                          value={c.value}
                          onChange={(e) =>
                            charge(kind, { ...c, value: e.target.value })
                          }
                        />
                      </Field>
                      <Field label={t("bill.type")}>
                        <select
                          className="select w-full"
                          value={c.type}
                          onChange={(e) =>
                            charge(kind, { ...c, type: e.target.value })
                          }
                        >
                          <option value="amount">{t("bill.amount")}</option>
                          <option
                            value="percent"
                            disabled={c.included && kind !== "vat"}
                          >
                            {t("bill.percent")}
                          </option>
                        </select>
                      </Field>
                      <Field label={t("bill.base")}>
                        <select
                          className="select w-full"
                          value={c.base}
                          onChange={(e) =>
                            charge(kind, { ...c, base: e.target.value })
                          }
                        >
                          {(kind === "service"
                            ? ["items"]
                            : kind === "vat"
                              ? ["items", "itemsService"]
                              : ["beforeCharges", "afterCharges"]
                          ).map((base) => (
                            <option key={base} value={base}>
                              {t("bill." + base)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={c.included}
                          onChange={(e) =>
                            charge(kind, {
                              ...c,
                              included: e.target.checked,
                              type:
                                e.target.checked && kind !== "vat"
                                  ? "amount"
                                  : c.type,
                            })
                          }
                        />
                        {t("bill.included")}
                      </label>
                    </div>
                    <SplitEditor
                      value={c.split}
                      onChange={(split) => charge(kind, { ...c, split })}
                      members={active}
                      proportional
                    />
                  </>
                )}
              </section>
            );
          })}
        </div>
        <section className="space-y-2">
          <h3 className="font-bold text-lg">{t("bill.stepPayers")}</h3>
          <p className="text-sm text-base-content/70">{t("bill.payerNote")}</p>
          {active.map((m) => {
            const payment = form.payments.find((p) => p.memberId === m.id);
            return (
              <div key={m.id} className="flex flex-wrap gap-2 items-center">
                <label className="flex gap-2 items-center min-w-32">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={!!payment}
                    onChange={(e) =>
                      change({
                        ...form,
                        payments: e.target.checked
                          ? [...form.payments, { memberId: m.id, amount: "0" }]
                          : form.payments.filter((p) => p.memberId !== m.id),
                      })
                    }
                  />
                  {m.name}
                </label>
                {payment && (
                  <MoneyInput
                    aria-label={`${t("bill.paid")} ${m.name}`}
                    className="input w-36"
                    value={payment.amount}
                    onChange={(e) =>
                      change({
                        ...form,
                        payments: form.payments.map((p) =>
                          p.memberId === m.id
                            ? { ...p, amount: e.target.value }
                            : p,
                        ),
                      })
                    }
                  />
                )}
              </div>
            );
          })}
        </section>
        <Field label={t("bill.receipt")}>
          <MoneyInput
            value={form.receiptTotal || ""}
            onChange={(e) => {
              const next = { ...form };
              if (e.target.value) next.receiptTotal = e.target.value;
              else delete next.receiptTotal;
              change(next);
            }}
          />
        </Field>
        {error && (
          <p role="alert" className="text-error">
            {t("bill.invalid")}
          </p>
        )}
        {preview && (
          <section
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2"
            aria-label={t("bill.preview")}
          >
            <h3 className="font-bold">
              {t("bill.total")}: ฿{moneyText(preview.total)}
            </h3>
            {preview.lines.map((l, i) => (
              <p key={i}>
                {l.name}: ฿{moneyText(l.total)}
              </p>
            ))}
            {preview.charges.map((c) => (
              <p key={c.kind}>
                {t("bill." + c.kind)}: ฿{moneyText(c.total)} · {t("bill.base")}{" "}
                ฿{moneyText(c.baseAmount)} ·{" "}
                {t(c.included ? "bill.included" : "bill.added")}
              </p>
            ))}
            {members
              .filter((m) => preview.shares[m.id] !== undefined)
              .map((m) => (
                <p key={m.id}>
                  {m.name} — {t("bill.share")}: ฿
                  {moneyText(preview.shares[m.id])}
                </p>
              ))}
            <p>
              {t("bill.paymentTotal")}: ฿{moneyText(preview.paymentTotal)}
            </p>
            {preview.paymentTotal !== preview.total && (
              <p className="text-warning">{t("bill.paymentMismatch")}</p>
            )}
            {form.payments.length === 1 &&
              preview.paymentTotal !== preview.total && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() =>
                    change({
                      ...form,
                      payments: [
                        {
                          ...form.payments[0],
                          amount: moneyText(preview.total),
                        },
                      ],
                    })
                  }
                >
                  {t("bill.fillPayer")}
                </button>
              )}
          </section>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy || loading}
            className="btn btn-outline"
            type="submit"
          >
            {loading ? "…" : t("bill.preview")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              busy || !preview || preview.paymentTotal !== preview.total
            }
            onClick={() => onSave(form)}
          >
            {t("bill.confirmBill")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t("common.cancel")}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
