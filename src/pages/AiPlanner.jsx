import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mainApi } from "@/api/mainApi";
import ThemeToggle from "@/components/ThemeToggle";

const types = {
  ATTRACTION: "สถานที่เที่ยว",
  RESTAURANT: "อาหาร",
  TRANSPORT: "เดินทาง",
  ACCOMMODATION: "ที่พัก",
};
const money = (value) =>
  Number(value).toLocaleString("th-TH", { maximumFractionDigits: 2 });
const rangeDays = (start, end) =>
  (Date.parse(end) - Date.parse(start)) / 86400000 + 1;

function requestError(error, saving = false) {
  const status = error.response?.status;
  if (status === 429)
    return "เรียกใช้งานถึงขีดจำกัดแล้ว กรุณารอสักครู่ หรือกลับมาใหม่เมื่อโควตารายวันเริ่มรอบใหม่";
  if (status === 400)
    return "ข้อมูลไม่ถูกต้อง กรุณาตรวจวันที่ เวลา ชื่อกิจกรรม และค่าใช้จ่าย";
  if (status === 404) return "ไม่พบฉบับร่างนี้ กรุณาร่างแผนใหม่";
  return saving
    ? "ยังยืนยันผลการบันทึกไม่ได้ กดบันทึกอีกครั้งเพื่อตรวจและรับทริปเดิมโดยไม่สร้างซ้ำ"
    : "AI ยังร่างแผนไม่ได้ อาจติดการเชื่อมต่อหรือการตั้งค่า กรุณาลองใหม่ ข้อความของคุณยังอยู่";
}

export default function AiPlanner() {
  const navigate = useNavigate();
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
      setError("เลือกวันสิ้นสุดให้ตรงกับหรืออยู่หลังวันเริ่มเดินทาง");
      return;
    }
    inFlight.current = true;
    setBusy("draft");
    setError("");
    try {
      const response = await mainApi.post("/planner/draft", request, {
        timeout: 45000,
      });
      setDraft(response.data.data);
      submittedPlan.current = null;
      setUncertain(false);
    } catch (err) {
      setError(requestError(err));
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
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <Link to="/dashboard" className="btn btn-ghost rounded-full">
            ← กลับหน้าทริป
          </Link>
          <ThemeToggle />
        </header>
        <section className="space-y-3">
          <span className="badge badge-outline">
            AI TRIP PLANNER · ทดลองใช้
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">
            เล่าทริปที่อยากไป ให้ AI ช่วยร่าง
          </h1>
          <p className="text-base-content/75 text-lg">
            บอกความต้องการ เลือกวันเดินทาง แล้วตรวจแผนก่อนบันทึกเป็นทริปของคุณ
          </p>
          <ol className="flex flex-wrap gap-3 text-sm" aria-label="ขั้นตอน">
            <li className={!draft ? "font-bold" : ""}>1. บอกความต้องการ</li>
            <li className={draft ? "font-bold" : ""}>2. ตรวจและแก้แผน</li>
            <li>3. บันทึกแล้วออกเดินทาง</li>
          </ol>
        </section>

        {error && (
          <div role="alert" className="alert alert-error break-words">
            {error}
          </div>
        )}
        {!draft ? (
          <form
            onSubmit={generate}
            className="bg-base-100 border border-base-content/15 rounded-3xl p-5 md:p-8 shadow-sm space-y-5"
          >
            <fieldset disabled={!!busy} className="space-y-5">
              <label className="block space-y-2">
                <span className="font-semibold text-lg">อยากเที่ยวแบบไหน?</span>
                <textarea
                  className="textarea w-full text-base min-h-40 rounded-none px-4 py-3 leading-relaxed"
                  style={{ borderRadius: 0, lineHeight: 1.75 }}
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="เช่น เชียงใหม่ ไป 2 คน งบรวม 10,000 บาท ชอบคาเฟ่และธรรมชาติ ไม่เช่ารถ ขอเที่ยวสบาย ๆ"
                  value={request.requirements}
                  onChange={(e) =>
                    setRequest({ ...request, requirements: e.target.value })
                  }
                />
                <span className="block text-sm text-base-content/70">
                  ใส่จุดหมาย จำนวนคน งบรวม และวิธีเดินทาง เพื่อให้แผนตรงใจ ·
                  ไม่ต้องใส่ข้อมูลส่วนตัว
                </span>
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="font-semibold">วันเริ่มเดินทาง</span>
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
                  <span className="font-semibold">วันสิ้นสุด</span>
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
                ไม่จำกัดจำนวนวันของทริป
                {Number.isInteger(days) && days > 0
                  ? ` · เลือกไว้ ${days} วัน`
                  : ""}
              </p>
              <div
                className="bg-base-200 p-4 space-y-2 text-sm leading-relaxed"
                role="note"
              >
                <p className="font-semibold">
                  ยิ่งหลายวัน ยิ่งใช้ token และเวลามากขึ้น
                </p>
                <p>
                  AI อ่านข้อความและสร้างคำตอบโดยใช้ token ไม่ใช่จำนวนวันโดยตรง
                  ระบบร่างทีละไม่เกิน 7 วัน แล้วให้กดร่างช่วงถัดไป
                  ใช้โควตาแยกแต่ละครั้ง
                </p>
                <p>
                  {Number.isInteger(days) && days > 0
                    ? `ทริปนี้แบ่งเป็น ${Math.ceil(days / 7)} ช่วง · `
                    : ""}
                  จำกัดการสร้างคำตอบ 6,000 tokens ต่อครั้ง
                  ไม่ใช่ยอดใช้จริงทั้งหมด ยังมี token ข้อความเข้าและการลองใหม่
                  ค่าใช้จ่ายขึ้นกับโมเดลและแพ็กเกจ API
                </p>
                <p>
                  โควตารายวันยังมีผล หากเต็มสามารถกลับมากดร่างต่อได้
                  โดยกรอกความต้องการและวันที่เดิมเพื่อทำต่อจากร่างที่เก็บไว้
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto rounded-full px-8"
              >
                {busy ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />{" "}
                    กำลังร่างแผน…
                  </>
                ) : (
                  "✨ ให้ AI ช่วยวางแผน"
                )}
              </button>
            </fieldset>
            <p className="text-sm text-base-content/70" role="status">
              {busy
                ? "อาจใช้เวลาประมาณ 30 วินาที ยังไม่มีการสร้างทริป"
                : "ความต้องการจะส่งให้ Gemini เพื่อร่างแผน และเก็บฉบับร่างไว้ในบัญชี ใช้โควตา AI ร่วมกับฟีเจอร์อากาศ"}
            </p>
          </form>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <div className="bg-base-100 border border-base-content/15 rounded-3xl p-5 space-y-3">
              <h2 className="text-2xl font-bold">ตรวจแผนก่อนบันทึก</h2>
              <p>
                {request.startDate} → {request.endDate} ·{" "}
                {draft.plan.days.length} วัน
              </p>
              <p className="text-sm">
                ร่างแล้ว {draft.plan.days.length} / {draft.totalDays || days}{" "}
                วัน · token ที่รายงานจากคำตอบในแผนนี้:{" "}
                {draft.tokens ? money(draft.tokens) : "ไม่มีข้อมูล"}{" "}
                (ไม่รวมคำขอที่ล้มเหลวหรือ fallback ก่อนสำเร็จ; cache ไม่เรียก AI
                เพิ่ม)
              </p>
              {draft.complete === false && (
                <div className="space-y-3">
                  <p>
                    แผนยังไม่ครบวัน ร่างช่วงถัดไปก่อนแก้ไขและบันทึก แต่ละช่วงใช้
                    token และโควตาเพิ่ม
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!busy}
                    onClick={() => generate()}
                  >
                    {busy ? "กำลังร่างช่วงถัดไป…" : "ร่างช่วงถัดไป"}
                  </button>
                </div>
              )}
              <p className="font-semibold text-lg">
                งบกิจกรรมประมาณการรวมทั้งกลุ่ม: ฿{money(total)}
              </p>
              <p className="text-sm text-base-content/75">
                รวมเฉพาะรายการด้านล่าง ไม่ใช่ราคาจองจริง โปรดตรวจสถานที่
                เวลาเปิด และการเดินทางอีกครั้ง
                พิกัดจะค้นหาด้วยระบบแผนที่หลังบันทึก
              </p>
              {draft.plan.assumptions.length > 0 && (
                <div>
                  <h3 className="font-bold">สมมติฐานของแผน</h3>
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
                <span className="font-semibold">ชื่อทริป</span>
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
                    วันที่ {di + 1} · {day.date}
                  </h3>
                  <p className="text-base-content/75">{day.description}</p>
                  {day.activities.map((a, ai) => (
                    <div
                      key={ai}
                      className="border border-base-content/15 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="badge badge-ghost">
                          {types[a.activityType]}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          aria-label={`ลบกิจกรรม ${a.locationName}`}
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
                          ลบกิจกรรม
                        </button>
                      </div>
                      <label className="block space-y-1">
                        <span>สถานที่ / กิจกรรม</span>
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
                          <span>เวลา</span>
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
                          <span>ประมาณการ (บาท)</span>
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
                        <span>รายละเอียด / การเดินทาง</span>
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
                  {!day.activities.length && (
                    <p>ยังไม่มีกิจกรรมวันนี้ เพิ่มได้ในหน้าทริปหลังบันทึก</p>
                  )}
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
                  ? "กำลังบันทึก…"
                  : uncertain
                    ? "ลองบันทึกอีกครั้ง"
                    : "บันทึกเป็นทริปของฉัน"}
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
                กลับไปแก้ความต้องการ
              </button>
              <p className="w-full text-sm text-base-content/70">
                {uncertain
                  ? "พักการแก้ไขไว้จนกว่าจะยืนยันผลบันทึกได้ เพื่อป้องกันข้อมูลไม่ตรงกัน"
                  : "ยังไม่สร้างทริปจนกว่าจะกดบันทึก · การแก้ไขในหน้านี้จะหายเมื่อรีเฟรชหน้า"}
              </p>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
