## Manual weather (2026-10-01)

This is a separate user observation, not AI output. Edit a day/activity and use the weather fields. All fields are optional; clearing one record does not affect any other day/activity or AI history. Shared links include these observations with the itinerary, so avoid private notes in a publicly shared trip.

API `manualWeather`: nullable object `{condition, temperatureC, descriptionCode, description}` on existing day/activity create/update bodies. Temperature is a finite JSON number −100..70 °C; description max 1,000 characters. Omitted object preserves current data, null clears, all-empty object normalizes to null. Enum catalogs: API `src/validations/manual-weather.js`, Front `src/constants/manualWeather.js`. UI translations have four languages. Persisted presets are codes, custom text stays as written.

API setup: `npm run migrate:manual-weather` (idempotent, additive JSONB columns, no reset) then `npx prisma generate`. Restart API if running a non-watched process. Applied locally against configured DB; each other environment needs its own migration.

Condition coverage follows [NWS weather icon categories](https://www.weather.gov/forecast-icons), with an Other option for unlisted combinations. Description presets are editorial usability choices, not official weather measurements. No automatic weather provider lookup was added.

# AI Weather — 2026-09-28

## Behavior
- วิเคราะห์พื้นที่กิจกรรมรายวัน แยกเช้า/กลางวัน/เย็น พร้อมผลต่อกิจกรรมและสิ่งที่ควรเตรียม ตอบตามภาษา th/en/zh/ko
- เป็นแนวโน้มตามฤดูกาลจาก AI ยังไม่มี weather provider สด ห้ามอ้างว่าเป็นพยากรณ์ยืนยันหรือแต่งตัวเลข/ประกาศภัย
- กล่องหลักสูง 32rem (จำกัดตาม viewport) ข้อความและประวัติ scroll ภายใน ไม่ขยายตามคำตอบ
- Modal อ่านคำตอบเต็มและประวัติเก่าได้ แม้ไม่มี ---DETAILS---; native dialog รองรับ Escape, focus และอ่านบนมือถือ

## Prompt / API contract
- Front ส่งเพียง tripId + language; API ตรวจเจ้าของและอ่าน itinerary จาก DB
- src/services/weather-prompt.js รวบรวมสถานที่ไม่ซ้ำเป็น P1/P2 แล้วส่งตารางวันเต็ม YYYY-MM-DD เวลา ประเภทกิจกรรมและพิกัดที่มี
- ไม่ส่งราคา ID ผู้ใช้ หรือ description ยาว; ดึงเฉพาะช่วงเวลาเดินทางจาก description
- Prompt กำหนดโครงสร้างสั้น ไม่ทวน itinerary ทั้งก้อน ไม่แต่งกิจกรรมช่วงว่าง และระบุความไม่แน่นอน
- Cache 6 ชั่วโมง fingerprint v3 ครอบคลุม prompt/language/วันที่/เวลา/พื้นที่ เปลี่ยนข้อมูลแล้วไม่ใช้คำตอบเก่า
- Input เกิน 24,000 characters คืน 413 ก่อนเรียก provider; output budget ตามจำนวนวัน 1,800–8,192 tokens ไม่ใช่ยอด token ใช้จริง
- Provider ตอบ MAX_TOKENS จะคืน error ไม่บันทึกคำตอบที่ถูกตัด; ทริปยาวมากยังติดขีดจำกัด provider ได้ ไม่มีการแบ่ง weather เป็นหลาย request รอบนี้
- ประวัติเก็บคำตอบเต็มได้ถึง 64,000 characters แทนการตัดที่ 8,000; รายการเก่าที่เคยถูกตัดกู้ส่วนที่หายไม่ได้
- Quota, authentication, ownership และ fallback เดิมยังใช้งาน ไม่เพิ่ม dependency/schema/env

## Validation / next agent
- API unit 33 ผ่าน; prompt tests ตรวจ dedup, เวลา, ภาษา, ข้อมูลไม่จำเป็นและขนาด
- Front unit 11 ผ่าน, build ผ่าน; lint ไม่มี error เหลือ 7 warnings ในไฟล์อื่น
- Browser weather desktop/mobile ตรวจ modal/history/current report/scroll/ขนาด card และ request payload ผ่าน
- ใช้ fixtures ไม่เรียก Gemini จริงหรือแก้ฐานข้อมูล demo; คุณภาพคำตอบจริงและ latency ยังต้องทดลองด้วย provider
- หากเพิ่มพยากรณ์จริงในอนาคต ต้องมีแหล่งข้อมูล วันที่อัปเดต และขอบเขตช่วงพยากรณ์ก่อนเปลี่ยนคำอธิบาย seasonal guidance
