# AI Trip Planner MVP — 2026-09-27

## ใช้งาน
1. รัน `npm run dev` ใน PersonalProject_API และ PersonalProject_Front แยก terminal เหมือนเดิม
2. Login → Dashboard → “ให้ AI ช่วยวางแผน” หรือเปิด `/trips/ai`
3. กรอกจุดหมาย จำนวนคน งบรวม วิธีเดินทาง/ความชอบ และเลือกวันเริ่ม–สิ้นสุด 1–7 วัน
4. ตรวจสมมติฐาน/กิจกรรม แก้ชื่อทริป สถานที่ เวลา ราคา รายละเอียด หรือลบกิจกรรม
5. กดบันทึกเป็นทริปของฉัน → เปิด `/trips/:id` ใช้แก้กิจกรรม งบ แชร์ และแผนที่เดิม

## สิ่งที่ผู้ใช้ต้องทำ
- [ ] รัน backend และ frontend จากสอง repo เดิม และรีเฟรช Dashboard
- [ ] Backend `.env` ต้องมี GEMINI_API_KEY และ GEMINI_MODEL ที่บัญชีเรียกได้; AI_ENABLED ต้องไม่เป็น false (ใช้ค่าเดิมได้ ไม่ใส่ key ใน frontend)
- [ ] ลองโจทย์จริงหนึ่งทริป ตรวจจำนวนคน งบรวม สถานที่ และการเดินทางก่อนบันทึก
- [ ] ตรวจราคาจริง เวลาเปิด และตำแหน่งแผนที่ก่อนเดินทาง
- ไม่ต้อง npm install เพิ่ม ไม่ต้อง migrate schema และไม่ต้องแก้ข้อมูล mock/demo เดิม

## ขอบเขตและข้อมูล
UI ใหม่เป็นภาษาไทย; 1–7 วัน ไม่เกิน 4 กิจกรรมต่อวัน ค่าใช้จ่ายประมาณการเป็น THB รวมทั้งกลุ่ม เฉพาะรายการที่แสดง ไม่ใช่ยอดจองจริง ใช้ Gemini เดิม ไม่มี OpenAI/Groq เพิ่ม
ข้อความความต้องการส่งไป Gemini และเก็บใน AiMessage(kind=PLAN) ของบัญชี ไม่มี Trip ก่อนยืนยัน ฉบับร่างที่เหมือนเดิมและยังไม่บันทึกใช้ cache 6 ชั่วโมง (อายุ cache ไม่ใช่อายุการลบข้อมูล)
ฉบับร่างและใบยืนยันเก็บตามอายุข้อมูลบัญชี/ทริป ไม่มีงาน cleanup ใหม่ การลบบัญชีใช้ cascade เดิม ไม่เก็บคำตอบใน weather history
การแก้ใน preview เก็บในหน่วยความจำหน้าเว็บ รีเฟรชแล้วการแก้หาย; กรอกคำขอเดิมอาจได้ร่างต้นฉบับจาก cache
ถ้าผลบันทึกไม่แน่นอนเพราะเน็ตหลุด จะพักการแก้และให้ retry ด้วย payload เดิม; server คืนทริปเดิมสำหรับ draftId เดิมข้าม process/restart
AI ไม่สร้าง coordinates; map ค้นหาผ่านระบบเดิม ผลค้นหาอาจคลาดเคลื่อน ต้องตรวจหมุด

## API และไฟล์สำหรับ agent ถัดไป
- `POST /api/planner/draft`: auth + rate limit + `{requirements,startDate,endDate}`; คืน `{data:{draftId,request,plan,cached}}`
- `POST /api/planner/:draftId/confirm`: auth + `{plan}`; คืน `{data:{id,replayed}}`
- API `src/validations/planner.js`: schema สำหรับ input/output และวันต่อเนื่อง; schema provider ใช้เฉพาะโครงสร้าง ส่วนข้อจำกัดจริงบังคับด้วย Zod
- API `src/services/planner.service.js`: draft/cache/prompt และแปลงเป็น nested Prisma create; ใช้ `withCreationLimit` lock เดิม ครอบ count(100 trips), create และ receipt update ใน transaction เดียว
- API `src/services/model-fallback.js`: generateAiContent ใช้ร่วมกัน; generateWeather alias คงค่า weather เดิม 1,500 tokens/25s/fallback เฉพาะ 404/503; planner ส่ง config 6,000 tokens/JSON
- API `src/services/ai.service.js`: weather history/delete จำกัด kind=WEATHER ป้องกัน PLAN receipt ถูกลบ
- Front `src/pages/AiPlanner.jsx`: form, calendar, preview, confirmation และ recovery; lazy route `/trips/ai`
- ไม่มี schema/dependency/env migration; ห้ามใช้ smoke test กับฐาน demo จริง

## การตรวจ
- API `npm test`: 27 ผ่าน รวม schema/date/ownership/UTC/no-coordinates
- Front `npm test`: 7 ผ่าน; build/SEO ผ่าน; lint 9 warnings เดิม ไม่มี error ใหม่
- `npm run test:e2e -- tests/e2e/planner.spec.js`: desktop/mobile 2 ผ่าน (API จำลอง) รวม failure/retry, preview edit/delete, no pre-confirm save, narrow viewport
- API `scripts/planner-smoke.js`: ต้องใช้ localhost DB ชื่อลงท้าย `_test`; ทดสอบ rollback จริง, ownership, mismatch dates, 5 confirmations พร้อมกันได้ทริปเดียว, weather isolation
- Live Gemini ทดสอบผ่านด้วยโจทย์เชียงใหม่ 1 วัน ได้ JSON ผ่าน Zod + cache hit + ไม่มี Trip ก่อนยืนยัน; ไม่ใช่การรับรองความถูกต้องของสถานที่/ราคา และยังไม่ได้ทดสอบคุณภาพทุกช่วง 2–7 วัน
- `--live-ai` เป็น opt-in เรียก Gemini จริง ใช้ key/model จาก backend env แต่ quota/ข้อมูลทดสอบอยู่ใน DB ชั่วคราว

อ้างอิง contract ของ provider: https://ai.google.dev/gemini-api/docs/generate-content/structured-output
