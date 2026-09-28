import { useLang } from "@/i18n";
export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm min-w-0">
      <span className="font-semibold">{label}</span>
      {children}
    </label>
  );
}
export function MoneyInput(props) {
  return (
    <input
      className="input w-full"
      inputMode="decimal"
      pattern="[0-9]+([.][0-9]{1,2})?"
      {...props}
    />
  );
}
export default function SplitEditor({
  value,
  onChange,
  members,
  proportional = false,
}) {
  const { t } = useLang();
  const modes = [
    "equal",
    "amount",
    "percent",
    "weight",
    ...(proportional ? ["proportional"] : []),
  ];
  return (
    <div className="space-y-2">
      <Field label={t("bill.split")}>
        <select
          className="select w-full"
          value={value.mode}
          onChange={(e) =>
            onChange({
              mode: e.target.value,
              parts: value.parts.map((p) => ({
                ...p,
                value: value.mode === "equal" ? "1" : p.value || "1",
              })),
            })
          }
        >
          {modes.map((mode) => (
            <option key={mode} value={mode}>
              {t("bill." + mode)}
            </option>
          ))}
        </select>
      </Field>
      {value.mode !== "proportional" && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const part = value.parts.find((p) => p.memberId === m.id);
            return (
              <div
                key={m.id}
                className="border border-base-content/15 rounded-lg p-2 flex items-center gap-2"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={!!part}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        parts: e.target.checked
                          ? [...value.parts, { memberId: m.id, value: "1" }]
                          : value.parts.filter((p) => p.memberId !== m.id),
                      })
                    }
                  />
                  {m.name}
                </label>
                {part && value.mode !== "equal" && (
                  <MoneyInput
                    aria-label={`${m.name} ${t("bill." + value.mode)}`}
                    className="input input-sm w-24"
                    value={part.value || ""}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        parts: value.parts.map((p) =>
                          p.memberId === m.id
                            ? { ...p, value: e.target.value }
                            : p,
                        ),
                      })
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
