# Security Review — AI LHOUNG

วันที่ตรวจ: 2026-09-25

สถานะอัปเดต 2026-09-26: **แก้ security หลักแล้ว** รายงานด้านล่างเก็บผลตรวจเดิมวันที่ 2026-09-25 ไว้เป็นประวัติ checklist เดิมที่ยังไม่ติ๊กไม่ใช่สถานะล่าสุด ให้ยึดรายการนี้และ HANDOVER หัวข้อ 5.8

| งาน | สถานะล่าสุด |
|---|---|
| ยืนยันรหัสเดิม / เพิกถอน token | ทำแล้ว: tokenVersion, JWT 1 ชั่วโมง, logout ทุก session |
| รหัสผ่าน / secret | ทำแล้ว: 15 ตัว, สูงสุด 72 bytes, bcrypt 12, production config validation และเปลี่ยน local secret |
| error / validation | ทำแล้ว: response/log กรองข้อมูลภายใน และ schema ของ CRUD/IDs |
| AI / resource limits | ทำแล้ว: ownership ก่อน provider, durable quota, cache/timeout/token limit, transactional resource caps และ trip pagination |
| สิทธิ์ DB | ทำแล้ว: migration + runtime role สิทธิ์จำกัดและยืนยัน CRUD จริง |
| dependency | ปรับแล้ว: Prisma 7.10.0 พร้อม security overrides; audit รายงาน 0 หลังติดตั้ง |
| frontend headers | เพิ่ม config Vercel/Netlify-style แล้ว ยังต้องตรวจ header บน host จริง |
| localStorage / shared IP limiter / breach check | ยังไม่ได้เปลี่ยน; ดูข้อจำกัดใน handover |
| หลักฐาน | unit tests backend 7/frontend 4 และ two-user API integration ผ่าน; ไม่ใช่ full penetration test |

รายละเอียดวิธี deploy/ข้อจำกัด: [HANDOVER.md หัวข้อ 5.8](HANDOVER.md#58-รอบ-10--performance-และ-security-2026-09-26)

---

**ผลตรวจเดิม (ก่อนแก้):**

## ความพร้อมในการ deploy

พื้นฐานเหมาะกับ MVP และต่อยอดได้โดยไม่ต้องรื้อระบบ แต่ยังไม่แนะนำให้เปิดสมัครใช้งานสาธารณะทันที ต้องแก้รายการสำคัญด้านล่างก่อน แม้เป็นเดโมหรือการทดลองกลุ่มเล็กก็ควรแก้เรื่องบัญชีผู้ใช้, secret และ error ก่อนนำขึ้นอินเทอร์เน็ต การ build ผ่านไม่ได้ยืนยันความปลอดภัยของระบบ

ผลตรวจนี้ครอบคลุม frontend และ backend ในเครื่อง ไม่ใช่ penetration test หรือการรับรอง production ดูขั้นตอนส่งมอบเพิ่มเติมใน [HANDOVER.md](HANDOVER.md) และแผนพัฒนาใน [ROADMAP.md](ROADMAP.md)

## สิ่งที่มีอยู่แล้ว

- Backend ตรวจเจ้าของทริป วัน กิจกรรม และประวัติ AI ก่อนอ่านหรือแก้ไขข้อมูลใน service ที่ตรวจ
- เก็บรหัสผ่านด้วย bcrypt และตรวจ JWT โดยจำกัด algorithm เป็น HS256 พร้อมวันหมดอายุ
- มี Helmet, CORS จำกัด origin, JSON body limit 100 KB และ rate limit สำหรับ auth/AI
- ลิงก์แชร์ใช้ token สุ่ม 32 bytes ยกเลิกได้ และเลือกฟิลด์ที่ส่งออก ไม่ส่ง password หรือ userId
- ไม่พบ `.env` จริงถูก track หรืออยู่ในประวัติ Git ของชื่อไฟล์ env ที่ตรวจ แต่ยังไม่ได้สแกน secret ทุกไฟล์และทุก commit

## งานสำคัญก่อนเปิด public

รายการเรียงตามลำดับที่ควรแก้ ไม่ใช่คะแนน CVSS

### 1. เปลี่ยนรหัสผ่านและเพิกถอน session

**พบ:** `PersonalProject_API/src/controllers/users.controller.js` รับ password ใหม่โดยไม่ถามรหัสเดิม JWT มีอายุ 1 วัน และ auth middleware ไม่ตรวจสถานะเพิกถอนหรือเวอร์ชัน session ส่วน logout ใน frontend ล้าง state ฝั่งเครื่องเท่านั้น

**ผลกระทบ:** หาก token ถูกขโมย ผู้โจมตีเปลี่ยนรหัสผ่านได้ และการเปลี่ยนรหัสผ่านของเจ้าของบัญชีไม่ทำให้ token เก่าหมดสิทธิ์ทันที

- [ ] ให้ยืนยันรหัสเดิมหรือยืนยันตัวตนใหม่ก่อนเปลี่ยนรหัสผ่าน
- [ ] เพิ่มกลไกเพิกถอน เช่น session ฝั่ง server หรือ tokenVersion และตรวจทุก request
- [ ] เมื่อเปลี่ยนรหัสผ่านให้ยกเลิก session เก่า และกำหนดพฤติกรรม logout ให้ชัดเจน
- [ ] ทดสอบว่า token เก่าเข้า protected API ไม่ได้หลังเพิกถอน

### 2. นโยบายรหัสผ่านและ JWT secret

**พบ:** `PersonalProject_API/src/validations/schema.js` และ endpoint แก้โปรไฟล์รับรหัสผ่านสั้น 4 ตัว ส่วน JWT secret ใน config เครื่องที่ตรวจมีความยาว 15 ตัว ไม่ได้บันทึกค่า secret ลงรายงาน และยังไม่ได้ตรวจค่า production

- [ ] เพิ่มความแข็งแรงของรหัสผ่านให้สอดคล้องกันทั้งสมัครและเปลี่ยนรหัสผ่าน รวมถึง frontend
- [ ] อ้างอิง OWASP: หากไม่มี MFA รหัสผ่านสั้นกว่า 15 ตัวถือว่าอ่อนแอ รองรับ passphrase และตรวจรหัสผ่านที่พบบ่อย/รั่วไหล
- [ ] รองรับรหัสผ่านยาวโดยไม่ตัดทิ้งเงียบ ๆ โดยคำนึงถึงข้อจำกัด bcrypt ที่ 72 bytes
- [ ] สร้าง JWT secret สำหรับ production ด้วยค่าที่สุ่มอย่างปลอดภัยอย่างน้อย 32 bytes แยกจาก development
- [ ] ตรวจ config ตอน startup และหยุดทำงานเมื่อ secret หายหรือเป็น placeholder

### 3. Error และ log เปิดเผยรายละเอียดภายใน

**พบ:** `PersonalProject_API/src/middlewares/errorHandler.js` ส่ง `err.message` กลับตรง ๆ แม้เป็น HTTP 500 และ log error ทั้งก้อน

**ผลกระทบ:** ข้อผิดพลาดจาก Prisma หรือระบบภายในอาจเปิดเผยรายละเอียดคำสั่งและข้อมูลที่เกี่ยวข้อง ไม่ได้ยืนยันว่ามี secret รั่วจริงแล้ว

- [ ] ตอบข้อความกลางสำหรับ unexpected error พร้อม request ID
- [ ] แปลง validation/constraint error ที่รู้จักเป็น 400/409 โดยไม่ส่งรายละเอียดฐานข้อมูล
- [ ] กรอง password, token, connection URL และข้อมูลส่วนบุคคลออกจาก log
- [ ] ทดสอบว่า response และ log ไม่เปิดเผยข้อมูลภายใน

### 4. Validation ของ Trip/Day/Activity ยังไม่ครบ

**พบ:** controller ส่ง `req.body` ไป service และแปลงค่าบางส่วนเอง ยังไม่มี schema ครอบคลุมทุก endpoint ใน `src/services/trips.service.js`, `days.service.js` และ `activities.service.js`

- [ ] ตรวจ path ID ว่าเป็นจำนวนเต็มบวก และตรวจ query เช่น limit
- [ ] เพิ่ม schema สำหรับ create/update ของ Trip, Day และ Activity
- [ ] ตรวจความยาวข้อความ enum ราคา วันที่จริง และลำดับวันเริ่ม/สิ้นสุด
- [ ] ตรวจพิกัดเป็น finite number และอยู่ในช่วง latitude -90 ถึง 90 / longitude -180 ถึง 180
- [ ] ส่ง input ผิดรูปแบบแล้วต้องได้ 400 ก่อนถึง Prisma

### 5. จำกัดการใช้ AI และทรัพยากร

**พบ:** `src/app.js` จำกัด AI ตาม IP 30 requests/10 นาที ไม่มีโควต้ารายบัญชีหรือเพดานทั้งระบบในโค้ดที่ตรวจ ส่วน `src/controllers/weather.controller.js` เรียก Gemini ก่อนตรวจเจ้าของ trip ตอนบันทึกประวัติ และจับ error บันทึกไว้แล้วตอบสำเร็จต่อได้ ไม่พบการกำหนด output-token limit หรือ timeout ของ AI อย่างชัดเจนในจุดเรียกนี้

**ผลกระทบ:** สมาชิกอาจใช้โควต้าหรือค่า API มากเกินควร แม้ระบุ trip ที่ไม่มีสิทธิ์ก็เรียก AI ไปแล้ว ประเด็นนี้ไม่ได้ยืนยันว่าดึงข้อมูลทริปคนอื่นได้ เพราะ prompt ใช้ข้อมูลจาก request

- [ ] ตรวจเจ้าของ trip ก่อนเรียก Gemini หากส่ง tripId มา และกำหนดว่าจะอนุญาตคำขอที่ไม่มี tripId หรือไม่
- [ ] จำกัดรายบัญชีร่วมกับราย IP และเพดานค่าใช้จ่ายทั้งระบบ
- [ ] จอง/หักโควต้าแบบ atomic เพื่อกันคำขอพร้อมกัน และใช้ store ร่วมเมื่อรันหลาย instance
- [ ] กำหนด timeout, output-token limit, concurrency limit และแคชผลที่เหมาะสม
- [ ] จำกัดการสร้าง Trip/Day/Activity เพิ่ม pagination และ rate limit สำหรับ public share
- [ ] ตรวจ `trust proxy` ให้ตรงกับ hosting จริงก่อนพึ่ง IP rate limit
- [ ] ทดสอบว่าคำขอที่ไม่มีสิทธิ์หรือเกินโควต้าไม่เรียก provider

### 6. จำกัดสิทธิ์บัญชีฐานข้อมูล

**พบ:** DATABASE_URL ในเครื่องใช้ชื่อบัญชี `postgres` ของ Supabase ยังไม่ได้ query ตรวจ grant หรือ RLS บน server จริง

- [ ] แยก role สำหรับ runtime ให้มีเฉพาะสิทธิ์ที่แอปจำเป็นต้องใช้
- [ ] เก็บ role สำหรับ migration/DDL แยกจาก runtime
- [ ] ยืนยันสิทธิ์จริงและ RLS ด้วย role ที่ deploy ใช้งาน อย่าถือว่าเปิด RLS แล้วจะคุ้มครอง connection ของ owner อัตโนมัติ
- [ ] ทดสอบว่า runtime role ทำงานของแอปได้ แต่แก้ schema หรือจัดการ role ไม่ได้

## งานเสริมด้าน session และ secret

- [ ] ประเมินการเก็บ JWT ใน `src/stores/userStore.js` ซึ่ง persist ลง localStorage: หากเกิด XSS สคริปต์จะอ่าน token ได้ รอบนี้ยังไม่พบ XSS ที่ยืนยันได้ในจุดแสดงข้อความที่ตรวจ
- [ ] พิจารณา session ผ่าน Secure/HttpOnly/SameSite cookie พร้อมการป้องกัน CSRF ที่เหมาะกับ deployment หากย้ายจาก Bearer token
- [ ] ตั้ง CSP และ security headers ที่ host ของ frontend ด้วย Helmet ฝั่ง API ไม่ได้ตั้ง header ให้หน้า HTML ของ frontend ที่แยก host
- [ ] ปรับ `.gitignore` ฝั่ง API ให้กัน `.env*` โดยยกเว้น `.env.example` ปัจจุบันกัน `.env` และ backup แต่ยังไม่ครอบคลุม `.env.local`/`.env.production`
- [ ] ตรวจ secret ทั้ง repository และประวัติ Git ก่อน publish และหมุนค่าที่พบว่าเคยรั่ว

## หลักฐานการตรวจและข้อจำกัด

ทำแล้วในการตรวจรอบนี้:

- อ่าน routes, controllers, services, auth/JWT, schema/config และจุดเก็บ token/แสดงข้อความที่เกี่ยวข้องใน frontend
- `npm run build` ฝั่ง frontend ผ่าน มีคำเตือน bundle ใหญ่กว่า 500 KB (JavaScript ประมาณ 764.72 KB ก่อน gzip)
- ทดสอบแบบจำลองโดย mock `prisma.user.update`: เปลี่ยนรหัสผ่านได้โดยไม่มีรหัสเดิม และ JWT ที่ออกก่อนเปลี่ยนยังตรวจลายเซ็นผ่าน ไม่ได้เรียก protected HTTP endpoint กับฐานข้อมูลจริง
- ทดสอบว่า register schema ยอมรับรหัสผ่าน 4 ตัว
- ทดสอบ error handler ด้วย error สังเคราะห์: HTTP 500 ส่งข้อความภายในกลับจริง
- การทดสอบเฉพาะจุดเป็นสคริปต์ชั่วคราว ยังไม่มีชุด regression test ถูกเพิ่มใน repository และไม่ได้แก้ข้อมูลในฐานข้อมูลจริง

ยังไม่ได้ทำ:

- Penetration test หรือทดสอบสิทธิ์ข้ามบัญชีแบบ end-to-end กับฐานข้อมูลทดสอบ
- Dependency vulnerability audit
- ตรวจ HTTPS, reverse proxy, headers, secrets, grant/RLS, backup และ monitoring บน hosting จริง

## เกณฑ์ก่อนเปิดให้คนทั่วไปใช้

- [ ] ปิดงานสำคัญ 1–6 และทดสอบผลแก้ไข
- [ ] ทดสอบสองบัญชี: อ่าน/แก้/ลบ/แชร์ข้อมูลกันไม่ได้ รวม Day, Activity และประวัติ AI
- [ ] ทดสอบ public share ไม่เผยข้อมูลนอกขอบเขตและ revoke แล้วลิงก์ใช้ไม่ได้
- [ ] ตรวจ dependency, HTTPS, CORS, frontend headers, production config และ secret
- [ ] มี backup ที่ทดสอบ restore แล้ว และ monitoring/error tracking
- [ ] ทดสอบ flow หลักบน staging ก่อนเปิด production

## แหล่งอ้างอิง

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): นโยบายรหัสผ่านและยืนยันตัวตนก่อนเปลี่ยนรหัสผ่าน
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html): validation, access control, HTTPS และการจัดการ error


Final verification and deployment boundaries: see the final section of [HANDOVER.md](HANDOVER.md).
