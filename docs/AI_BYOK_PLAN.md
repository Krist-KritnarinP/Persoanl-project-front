# แผน BYOK — ผู้ใช้แต่ละคนใช้ AI key ของตนเอง

สถานะ: แผนอนาคต ยังไม่ได้เพิ่มช่องรับ key หรือเปลี่ยน provider credential ในระบบจริง

## ประสบการณ์ที่ต้องการ
ผู้ใช้เปิดตั้งค่าบัญชี → เชื่อม Gemini ด้วย API key ของตน → ทดสอบการเชื่อมต่อ → ใช้ร่างแผนเหมือนเดิม กดครั้งเดียวรอจนจบ ไม่ต้องจัดการช่วงงานเอง
ผู้ใช้ดูสถานะ key, โมเดล, usage, เปลี่ยน/ลบ key ได้ ไม่แสดง key เต็มหลังบันทึก
ค่าใช้จ่ายและ provider quota อยู่กับโปรเจกต์ของเจ้าของ key ไม่ใช้เงิน/โควตา key กลางของเว็บ เมื่อ key ผู้ใช้หมดโควตาจะไม่สลับไป key กลางเงียบ ๆ
Backend ยังทำหน้าที่ตรวจสิทธิ์/จัดงาน/บันทึกทริป; แยกจากการเป็นเจ้าของ key และผู้จ่ายค่า AI. ไม่ควรใส่ key ใน frontend bundle, localStorage, URL, Git หรือ analytics
Gemini คิด rate limits ต่อ project ไม่ใช่ต่อ key จึงต้องให้ผู้ใช้นำ key ของ project ของตนเองมา ไม่ใช่สร้างหลาย key ใต้ project กลางเพื่อแบ่งโควตา
อ้างอิง: https://ai.google.dev/gemini-api/docs/rate-limits และ https://ai.google.dev/gemini-api/docs/api-key

## ลำดับพัฒนา
- [ ] เพิ่ม UserAiCredential: userId/provider, ciphertext, nonce/auth tag, encryptionKeyVersion, สถานะและวันที่ตรวจล่าสุด; unique ต่อ user/provider; ไม่เก็บ plaintext
- [ ] เข้ารหัสแบบ authenticated encryption ฝั่ง backend ผูก userId/provider เป็น AAD; master key แยกจาก DB/backup ใน secret manager, เตรียม rotation และ revoke
- [ ] API ตั้งค่า/ตรวจ/ลบ key ต้อง auth และตรวจเจ้าของจาก session เท่านั้น; จำกัดคำขอตรวจ key, เลือก provider endpoint จาก allowlist ป้องกัน SSRF; API ตอบแค่สถานะ/ท้าย key ที่ปิดบังแล้ว
- [ ] Secret resolver โหลดเฉพาะ key ของผู้ใช้ ณ เวลารัน; provider adapter รับ credential ตาม user ไม่อ่าน key กลางโดยอัตโนมัติ; fallback เปลี่ยนโมเดลได้เฉพาะภายใต้ credential และ consent เดิม
- [ ] แยก usage/cache/job ตาม user/provider/model/credential version. โควตาที่มีไว้คุมค่าใช้จ่าย key กลางไม่ใช้กับ BYOK แต่คง rate/concurrency/payload guard ของแอปและเคารพ provider limits
- [ ] UI consent เรื่องการส่งข้อมูลไปผู้ให้บริการ, token/ค่าใช้จ่ายเป็นของผู้ใช้, เปลี่ยน/ลบ key, error ที่เข้าใจง่าย; ห้าม key/ciphertext อยู่ใน log, Sentry, AI prompt/history, public share หรือ account export
- [ ] ทดสอบบัญชี A ใช้ key B ไม่ได้, เปลี่ยน/ลบ key ระหว่าง job, decrypt/rotation failure, quota, ไม่มี shared fallback, cascade delete credentials; ทดสอบกับบัญชีทดลองก่อน rollout

## ทริปยาวและงานเบื้องหลัง
ปัจจุบันกดครั้งเดียวโดย browser เรียกช่วงต่อให้อัตโนมัติ ต้องเปิดหน้าไว้; เปลี่ยนหน้าแล้วหยุดส่งงานเพิ่ม งาน provider ที่ส่งไปแล้วอาจยังใช้ token
- [ ] ย้าย orchestration ไป durable job/worker: pending/running/paused/completed, checkpoint รายช่วง, idempotency, progress polling/SSE, retry ตาม Retry-After และ cancel; ปิดหน้าแล้วกลับมาเห็นงานเดิม
- [ ] วางภาพรวมเส้นทาง/งบของทั้งทริปก่อนเติมรายละเอียดรายช่วง ลดการซ้ำสถานที่และงบเกิน แล้วตรวจวันครบก่อน preview
- [ ] เก็บ provider usage ทุก attempt รวม fallback/failure เท่าที่ provider รายงาน; แสดงรวมแบบเรียกดูรายละเอียดได้ ไม่รกหน้าสร้างทริป
- [ ] ข้อจำกัด token ต่อคำตอบ/โควตา provider และทรัพยากรยังมีจริง BYOK ไม่ทำให้ใช้งานได้ไม่จำกัดโดยไร้ต้นทุน
