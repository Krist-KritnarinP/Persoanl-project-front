# ROADMAP — จาก MVP สู่โปรดักชันที่เก็บเงินได้จริง

> สถานะปัจจุบัน (2026-09-27): MVP ใช้งานได้ (CRUD ทริป/วัน/กิจกรรม, AI พยากรณ์อากาศ, แชร์ลิงก์, 4 ภาษา)
> แต่ **ยังไม่พร้อม** รับ user จริง/เก็บเงิน — ขาด: ระบบจ่ายเงิน, external setup/PDPA/monitoring จริง
> ไฟล์นี้คือ task list แบ่ง phase + โมเดลสเกล + แพ็กเกจขาย

## Phase 0 — Production Readiness (อัปเดต 2026-09-26)

ส่วนโค้ด local ทำแล้ว แต่ยังมี external setup ค้างก่อน production ดู [Operations](../PersonalProject_API/docs/PHASE0_OPERATIONS.md)

- [x] Limited runtime DB role เดิมตรวจสิทธิ์อ่านตารางใหม่แล้ว; owner ใช้สำหรับ migration
- [x] JWT secret local ≥32 bytes, access 15 นาที + rotating HttpOnly refresh 7 วัน/revocation
- [x] AI cache 6 ชั่วโมง, per-user/global quota, explicit model/fallback/kill switch
- [x] Health/readiness + optional sanitized error tracking
- [x] Export/delete ข้อมูลพร้อม password confirmation ใน profile
- [x] CI แยกสอง repo และ unit/integration/browser tests
- [x] Google login + Forgot Password logic และ UI ใน original repos
- [x] สำรอง public schema/data ก่อน additive migration; mockup เดิมยังอยู่
- [ ] ตั้ง Google Client ID/SMTP และทดสอบ login/รับเมลจริง — [Checklist](../PersonalProject_API/docs/AUTH_SETUP.md)
- [ ] เปิด automatic backup และทดสอบ restore ข้อมูลจริงใน DB แยก
- [ ] ตรวจ model ที่ใช้ได้จริง + budget alert ของ AI
- [ ] เชื่อม error tracking/uptime monitor และทดสอบ alert จริง
- [ ] Privacy/Terms, ผู้ให้บริการ/อีเมลติดต่อ, retention/consent (รอข้อมูลจากผู้ใช้)
- [ ] แยก staging/production, domain/proxy/cookie และ credential rotation ตอนกลับมาทำ deploy
- [ ] จดทะเบียน/ระบบเอกสารการเงินเมื่อเริ่มรับเงิน

## Phase 1 — Core Value & Activation (3–4 สัปดาห์)

> AI Trip Planner MVP เปิดจาก Dashboard → /trips/ai; งานต่อยอดยังแยกไว้ด้านล่าง
- [x] **AI Trip Planner MVP**: ข้อความความต้องการ + ปฏิทินเริ่ม/สิ้นสุด ไม่จำกัดจำนวนวัน (กดครั้งเดียว ระบบร่างต่อจนครบ) → Gemini ร่าง JSON → ตรวจ/แก้/ลบกิจกรรม → ยืนยัน → สร้างทริปและเปิดหน้าเดิม
  - ตรวจวัน/เวลา/ราคา/ownership ด้วย Zod; AI ไม่ส่งพิกัด; บันทึกทั้งชุดใน transaction พร้อม account lock และ durable receipt กันยืนยันซ้ำ
  - ฉบับร่าง PLAN แยกจาก WEATHER; ร่าง v2 เก็บความคืบหน้าข้ามวันจนยืนยัน พร้อม progress และข้อความ token แบบสั้น; ใช้ AI quota/kill switch/fallback เดิม, output cap 6,000 tokens (ไม่ใช่ระบบ Pro/billing)
  - ราคา THB ประมาณการรวมทั้งกลุ่มและสมมติฐานแก้ได้ผ่านรายการ; ไม่ยืนยันราคาจริง/เวลาเปิด/เส้นทาง ไม่มีการจอง
  - วิธีใช้/ข้อจำกัด/ผลทดสอบ: [docs/AI_PLANNER.md](docs/AI_PLANNER.md)
- [ ] AI Planner ต่อ: แหล่งข้อมูลสถานที่/ราคาที่ตรวจสอบได้, reference prices + confidence ที่มีหลักฐาน, กู้ฉบับร่างที่แก้ไขหลังรีเฟรช, แก้ทริปเดิมผ่านแชต
- [x] คำนวณงบประมาณรวมจริง — ตรวจพบยอดรวมทริปและรายวันใน TripsActivity แล้ว
- [ ] Onboarding: ทริปตัวอย่าง + ทัวร์ 3 ขั้นตอนตอนสมัครครั้งแรก
- [x] Landing page + SEO พื้นฐาน — หน้า `/`, เนื้อหา 4 ภาษา, Thai HTML prerender, meta/OG และ canonical/sitemap เมื่อมีโดเมนจริง; Login ย้าย `/login`
- [ ] เปิด SEO บนโดเมนจริง + Search Console และ URL/hreflang แยกภาษา — ดู docs/LANDING_SEO.md
- [ ] PWA (install ได้, icon, offline หน้าอ่านทริป) — นักเดินทางใช้บนมือถือกลางทาง
- [ ] แจ้งเตือนก่อนเดินทาง (email/LINE OA): เช็กลิสต์ + อากาศล่วงหน้า 3 วัน
- [ ] **LINE Bot (Messaging API + LIFF) — ช่องทางหลักของคนไทย, เรียงตามคุ้มค่าสุด:**
  - ราคา OA ไทย (2026, +VAT 7%): Free 0฿/300 ข้อความ/เดือน, Basic 1,280฿/15,000, Pro 1,780฿/35,000 — **สำคัญ: ข้อความตอบกลับ (Reply) ฟรีไม่กินโควต้า** นับเฉพาะ push/broadcast → ออกแบบให้ bot ตอบเยอะๆ (ฟรี) push เฉพาะเรื่องสำคัญ
  - อันดับ 1 — **แจ้งเตือนทริป (push)**: อากาศก่อนเดินทาง 3 วัน, เช็กลิสต์ของ, เตือน passport/วีซ่าใกล้หมด (ต่อยอด Document Vault), เตือนไฟล์ท — 1,000 user × 4 ครั้ง/เดือน ≈ 4,000 ข้อความ = Basic เอาอยู่ (~0.3฿/user/เดือน)
  - อันดับ 2 — **แชทสร้างทริป**: พิมพ์ "อยากไปทะเล 3 วัน งบ 5000" ในแชท → bot ต่อ AI builder สร้างดราฟต์ทริป (reply ฟรี, ไม่ต้องลงแอป = ช่องหาลูกค้าใหม่)
  - อันดับ 3 — **แชร์ผ่าน LINE**: ส่งการ์ด Flex Message แผนทริปเข้ากลุ่มเพื่อน กดเปิด LIFF ดูทริปได้เลย (viral loop)
  - อันดับ 4 — **จ่ายเงินผ่าน LINE**: ส่ง QR PromptPay + แจ้งจ่ายสำเร็จในแชท (ต่อกับระบบ billing)
  - เทคนิค: lib `@line/bot-sdk` + `POST /api/line/webhook` (ตรวจ X-Line-Signature) + ผูก LINE userId ↔ บัญชีแอป (link ผ่าน LIFF login/OTP) + Rich menu ชี้ LIFF (เว็บเดิม ไม่ต้องทำ UI ใหม่) + scheduler (pg_cron/node-cron) ยิงแจ้งเตือน
  - **ผูกบัญชี (account linking) — รายละเอียด:**
    - DB: เพิ่ม `User.lineUserId String? @unique` (migration เดียว)
    - ท่าหลัก LIFF Login: แตะ Rich menu → เปิด LIFF (ได้ LINE userId + ชื่อ + รูปฟรี) → ถ้า login แอปแล้ว ยิง `POST /api/line/link` {lineUserId} พร้อม JWT → ผูกเสร็จ; ยังไม่ login ให้ login หน้าเดิมก่อนแล้วผูกต่ออัตโนมัติ
    - ท่าสำรอง OTP: แอปออกเลข 6 หลัก (หมดอายุ 10 นาที) → user พิมพ์ส่งเข้าห้องแชท → webhook จับคู่ผูกบัญชี (เผื่อ LIFF มีปัญหา)
    - เลิกผูก: ปุ่มในโปรไฟล์ + พิมพ์ "เลิกเชื่อม" ในแชท (ลบ `lineUserId`, หยุด push ทันที)
    - Security (ห้ามข้าม): อย่าเชื่อ userId จาก client ตรงๆ — เอา LIFF ID token ไป verify กับ LINE ฝั่ง server ก่อนผูกทุกครั้ง (กันปลอม); webhook ตรวจลายเซ็นทุก request (SDK มี middleware); ผูกบัญชี = ขอ consent รับ push ในจังหวะเดียวกัน (PDPA)
  - กฎ: push ต้อง opt-in ก่อน (PDPA) + ทุกข้อความมีปุ่มเลิกติดตาม
- [ ] Import/Export: ส่งออก PDF/พิมพ์แผนทริป, แชร์เป็นรูป
- [ ] **รูปภาพประกอบทริป**: อัปโหลดรูปต่อ activity/day → โชว์ใน timeline + หน้า share — ตาราง `trip_photos` (id, activityId?, dayId?, storagePath, caption)
  - **เก็บที่ Supabase Storage** (bucket `trip-photos` แบบ private + signed URL) — ไม่แยก vendor ตอนนี้: auth/RLS พร้อม, ฟรี 1 GB, อยู่ในโปรเจกต์เดียวกับ DB
  - บังคับย่อ/บีบอัดฝั่ง client ก่อนอัปโหลด (~200 KB/รูป → 1 GB เก็บได้ ~5,000 รูป)
  - **ย้ายไป Cloudflare R2 ก็ต่อเมื่อ**: storage เกิน 100 GB หรือ gallery คนดูเยอะ (R2 ชนะตรง egress ฟรี, S3-compatible ย้ายง่าย) — S3 AWS ยังไม่ต้อง (egress แพง)
- [ ] **Export PDF แผนเที่ยว**: ปุ่ม "ดาวน์โหลด PDF" ใน `/trips/:id` — ทำฝั่ง server (`GET /api/trips/:id/pdf`, ใช้ puppeteer/chromium บน server หรือ pdf-lib ประกอบเอง) ได้ไฟล์สวยพร้อมโลโก้/วันที่/งบรวม ไม่เสียค่า AI เพราะข้อมูลมีครบแล้ว; แคชไฟล์ 24 ชม.
  - **เก็บไฟล์ PDF ใน Supabase Storage** bucket `exports` (ไฟล์ละ ~100–500 KB, โหลดนาน ๆ ครั้ง) + ตาราง `trip_exports` (tripId, storagePath, generatedAt) ไว้เช็กแคช — ไม่ต้องแยกที่เก็บ

## Phase 2 — Growth & Retention (4–6 สัปดาห์)

- [ ] Template ทริปสาธารณะ (เช่น "ไอซ์แลนด์ 9 วัน" ที่มีอยู่แล้ว) → user กด duplicate เป็นของตัวเอง
- [ ] Public gallery + รีวิว/ให้ดาว template (UGC loop: ยิ่งแชร์ยิ่งมีคนเข้า)
- [ ] Referral: ชวนเพื่อนได้โควต้า AI เพิ่ม
- [ ] ทริปกลุ่ม (multi-user collaborate — วันนี้ 1 user = 1 ทริป)
- [ ] **ที่เที่ยว/ของกินใกล้เคียง (suggestion):** ใต้แต่ละ activity โชว์ "รอบๆ มีอะไรน่าแวะ" 3–5 ใบ กด + เพิ่มเป็นกิจกรรมได้เลย
  - ทำได้ง่ายเพราะ activity มี lat/lng แล้ว → ยิง Photon/Nominatim (ฟรี, ของเดิม) ค้นรอบรัศมี 5–10 กม. + ให้ AI ช่วยคัด/เขียนคำอธิบายสั้น (1 call รวมทั้งวัน ประหยัดโควต้า)
  - แคชผลตามพิกัด (ปัดเศษ 2 ตำแหน่ง) ไม่ต้องยิงซ้ำ
  - **วาง UI ตรงไหน (ไม่เพิ่มความรก): ไม่เพิ่ม section ถาวร** — ใส่ใน ActivityDetailModal ที่มีอยู่แล้ว เป็นแท็บ/ส่วน "รอบๆ ที่นี่" (ยิง API เฉพาะตอนเปิด modal) + ปุ่ม + เพิ่มเข้าทริปในการ์ดแต่ละใบ — หน้าหลักไม่รกขึ้นเลยสักพิกเซล
  - **รีวิวร้านอาหาร — 3 ระดับ (อย่าข้ามขั้น):**
    - ง่าย/ฟรี: ลิสต์ร้านรอบๆ จาก OSM/Photon + คำบรรยาย AI — ไม่มีข้อมูลรีวิวจริง ห้ามอ้างเรตติ้งมั่ว
    - กลาง/จ่าย (ทำตอนมีรายได้): Google Places API — ได้คะแนนจริง/จำนวนรีวิว/price level โชว์แบบข้อเท็จจริง ("4.5★ · 2,300 รีวิว") แคช 30 วันเพราะข้อมูลเปลี่ยนช้า (~$20–40/1,000 ที่ ต้นทุนต่อทริปไม่กี่สตางค์ถ้าแคช)
    - ยาก/อย่าเคลมเกินจริง: ป้าย "คนญี่ปุ่นรีวิวเยอะ" — Google ไม่ให้สัญชาตินักรีวิว ทำได้แค่ฮิวริสติกสัดส่วนภาษารีวิว (เช่น "รีวิวภาษาญี่ปุ่น 70%") ห้ามเขียนเป็นข้อเท็จจริงสัญชาติ; ส่วนป้ายเตือน "รีวิวไม่ดี ระวัง" เสี่ยงโดนร้านร้องเรียน — โชว์แค่คะแนนดิบให้ user ตัดสินใจเอง + แสดง attribution ตามเงื่อนไข Google
- [ ] **วิธีเดินทางจุดต่อจุด (transit hints) — 3 ระดับตามความยาก:**
  - ง่าย (ทำเลย): AI เขียนวิธีเดินทางกำกับทุก activity ตอนสร้างทริป ("JR + Nohi bus ~2 ชม. ~1,250฿") + ปุ่ม Google Maps ที่มีอยู่แล้ว — แทบไม่ต้องเพิ่มโค้ด
  - กลาง: ดึงเวลารถไฟ/บัสจริงจากตาราง static (GTFS ญี่ปุ่น/ยุโรป) — แม่นแต่ต้องหาข้อมูลรายประเทศ
  - ยาก/แพง (รอ B2B เรียก): Google Routes API แบบเรียลไทม์ (จ่ายต่อ request + ต้องเปิด billing) — อย่าทำก่อนมีลูกค้าจ่าย
- [ ] แอป native (Capacitor ห่อเว็บเดิม) ถ้า retention มือถือดี
- [ ] คอมมูนิตี้/บล็อก نکتهท่องเที่ยวขับ SEO ภาษาไทย (คำค้น "แพลนเที่ยว X" คู่แข่งน้อย)
- [ ] **Document Vault (ตู้เอกสารเดินทาง) — ของใหม่, เป็น Pro differentiator:**
  - เก็บขั้นต่ำก่อน: ประเภทเอกสาร (passport/visa/บัตร ปชช./ใบขับขี่สากล) + เลขที่ (mask โชว์ 4 ตัวท้าย) + **วันหมดอายุ** → แจ้งเตือนล่วงหน้า 90/30/7 วัน (cron + email/LINE)
  - อัปโหลดสแกน (optional): ไฟล์เข้า Supabase Storage bucket private + **เข้ารหัสก่อนเก็บ (AES-256-GCM, คีย์แยกต่อ user)** — ห้ามเก็บเลขเต็ม plaintext เด็ดขาด
  - กฎเหล็ก: RLS + access log ทุกครั้งที่เปิดดู + ปุ่มลบถาวร (PDPA) + แบนการส่งออกไฟล์เป็น bulk
  - ความเห็น: ควรทำ แต่ **เริ่มจากแค่ "วันหมดอายุ + แจ้งเตือน"** (เสี่ยงต่ำ) ก่อน แล้วค่อยเพิ่มห้องนิรภัยไฟล์ตอนมี security review — ข้อมูล passport หลุด = ความเสียหายสูงสุดของโปรดักต์

## Phase 2.5 — Future Backlog (ไอเดียเสริม ไว้หยิบตามเสียง user)

- [ ] **หารค่าใช้จ่าย + แชร์บิล** (split bill ต่อทริป/ต่อคน — ทริปเพื่อนขาดไม่ได่)
- [ ] **Packing checklist อัตโนมัติ** (ดึงจาก activities + อากาศ เช่น มี Blue Lagoon → ชุดว่ายน้ำ)
- [ ] **เช็กวีซ่าอัตโนมัติ** (passport TH → ประเทศนี้ต้องขอวีซ่าไหม + ลิงก์สถานทูต) — ต่อยอด Document Vault
- [ ] **ข้อมูลฉุกเฉินรายประเทศ** (เบอร์ฉุกเฉิน, สถานทูตไทย, ประกัน) แปะใน overview ทริป
- [ ] **ตัวแปลงค่าเงิน + บันทึกค่าใช้จ่ายเป็นบาทอัตโนมัติ**
- [ ] **Sync ปฏิทิน** (Export Google Calendar/ICS ราย activity)
- [ ] **Photo timeline**: รูปที่อัปโหลดผูกกับวันอัตโนมัติ → ทำ photobook/วิดีโอสรุปทริป (ขายเพิ่มเป็น one-time)
- [ ] **เตือนราคาตั๋ว/โรงแรม + affiliate** (Agoda/Booking/Airalo) — รายได้เสริมไม่ต้องสต๊อก
- [ ] **ประกันเดินทาง cross-sell** (partner กับโบรกเกอร์ กินค่าแนะนำ)
- [ ] **Live location + แชทกลุ่มต่อทริป** (ทริปเพื่อน/ทัวร์ — ระวัง scope บาน)
- [ ] Multi-currency + ภาษาที่ 5–6 (เวียดนาม/ญี่ปุ่น) เมื่อ traffic มา

## Phase 3 — Monetization (3–4 สัปดาห์)

- [ ] ตาราง `subscriptions` + `quotas` (โควต้า AI/ทริป/สมาชิกต่อแพ็กเกจ) + middleware เช็กก่อนยิง Gemini
- [ ] หน้าราคา + checkout + webhook ต่ออายุ/ยกเลิก
- [ ] **จ่ายด้วย PromptPay QR + เปิดสิทธิ์อัตโนมัติ (ไม่ตรวจสลิป):**
  - ตัดสินใจ: ใช้ **gateway (Stripe/Omise PromptPay 1.65%)** แทนทำ QR เอง — เพราะมี webhook แจ้งจ่ายสำเร็จ → เปิดสิทธิ์ทันที ไม่ต้องอัปโหลดสลิป
  - Flow: `POST /api/billing/checkout` {plan} → ได้ QR gateway → หน้าบ้านโชว์ QR + poll สถานะทุก 5 วิ → webhook `payment.success` → `subscriptions` active ทันที (ดีเลย์หลักวินาที–2 นาที)
  - เหตุผลที่ไม่ทำ QR เอง: QR เองไม่มีทางรู้ว่าใครโอน (ต้องอัปโหลดสลิปมาตรวจ = friction) — gateway เท่านั้นที่ยืนยันการจ่ายแบบเรียลไทม์ได้
  - ข้อจำกัดเดิม: PromptPay ทำ recurring ไม่ได้ → รายปี/ครั้งเดียว/B2B ด้วย PromptPay; รายเดือน auto-renew ด้วยบัตร (Stripe, ทำทีหลัง)
  - Env: `STRIPE_SECRET_KEY` / `OMISE_SECRET_KEY` + webhook secret — ห้ามอยู่ฝั่ง front เด็ดขาด
- [ ] ใบเสร็จ/ใบกำกับภาษี (e-Tax) — ลูกค้าองค์กรต้องการ
- [ ] โหมด B2B: แพ็กเกจบริษัททัวร์ (white-label share link + โลโก้ตัวเอง) — รายได้ก้อนใหญ่สุดของสายนี้
- [ ] Affiliate: ลิงก์จองโรงแรม/ตั๋ว (Agoda/Booking/Airalo) ใส่ใน activity อัตโนมัติ

## Phase 4 — Scale (ต่อเนื่อง)

- [ ] แยก read/write, PgBouncer/pooler tuning เมื่อ concurrent > 100
- [ ] กระจาย Gemini key หลายคีย์ + circuit breaker รายคีย์
- [ ] เก็บไฟล์รูป (Supabase Storage) + CDN — วันนี้ยังไม่มีอัปโหลดรูปเลย
- [ ] แยก service AI เป็น queue (BullMQ) กัน spike + ทำ batch
- [ ] Multi-region / สำรอง DB ข้าม region เมื่อ MRR ครอบคลุม

---

## โมเดลสเกล (ตัวเลขประมาณ, ก.ย. 2026)

### ต้นทุนต่อหน่วย (unit economics)
- **พยากรณ์อากาศ 1 ครั้ง**: prompt ~1,500 tokens + ตอบ ~50 tokens
  - ด้วย `gemini-3.8-flash` paid ($0.75/$3.75 ต่อ 1M): `(1500×0.75 + 50×3.75)/1M ≈ **$0.0013 ≈ 4–5 สตางค์/ครั้ง**
  - **AI สร้างทริปทั้งทริป** (ถ้าทำ Phase 1): ~8,000 in + 3,000 out ≈ **$0.017 ≈ 60 สตางค์/ทริป**
- **Free tier วันนี้**: จำกัด ~20 req/วันต่อคีย์ (เจอจริงมาแล้ว) → รับ user จริงต้องขึ้น paid + แคช
- **DB**: 1 ทริป (9 วัน 32 กิจกรรมแบบไอซ์แลนด์) ≈ 15–25 KB → Supabase free (500 MB) รับได้ ~20,000–30,000 ทริป
- **Bandwidth**: หน้าเว็บ ~600 KB/โหลด → free 5 GB/เดือน ≈ 8,000 pageviews/เดือน

### เพดานแต่ละขั้น
| ขั้น | รองรับ | ต้นทุนคงที่/เดือน | ทางออกเมื่อเต็ม |
|---|---|---|---|
| Hobby (วันนี้) | ~50 users, AI วันละ 20 ครั้งรวม | ~0 บาท | ขึ้น Gemini paid |
| Starter paid | ~500 users, AI ~3,000 ครั้ง/เดือน (~150 บาท) | Supabase Pro ~875 บาท + AI ~150 บาท ≈ **~1,000 บาท** | แคช + quota |
| Growth | ~5,000 users, AI ~30,000 ครั้ง (~1,500 บาท) | ~875 + ~1,500 + VPS/monitor ~1,000 ≈ **~3,500 บาท** | queue + multi-key |
| Scale | 50,000+ users | คิดตามใช้จริง + ทีม | แยก infra |

## แพ็กเกจขาย (Commercial)

### เกตเวย์ (ไทย, 2026)
- **Stripe TH**: บัตรในประเทศ **3.65% + ฿10**/ครั้ง, PromptPay **1.65%** (+VAT 7% บนค่าธรรมเนียม)
- **Omise**: บัตร 3.65% (+VAT), PromptPay 1.65%, Mobile banking ฿10/ครั้ง
- **คำแนะนำ**: เริ่มด้วย **Stripe** (สมัครง่าย, recurring + webhook พร้อม) — ค่าธรรมเนียมแพงกว่านิดหน่อยแต่ประหยัดค่า dev; ยอดถึง ~¥300k/เดือนค่อยต่อรอง Omise/2C2P

### ราคาแนะนำ (THB)
| แพ็กเกจ | ราคา | ได้อะไร | ต้นทุน AI/คน/เดือน | เหมาะกับ |
|---|---|---|---|---|
| **Free** | 0 | 3 ทริป, AI อากาศ 5 ครั้ง/เดือน, แชร์ลิงก์ | ~1 บาท | Hook + SEO |
| **Starter** | **฿79/เดือน** (หรือ ฿790/ปี) | ทริปไม่จำกัด, AI 100 ครั้ง/เดือน, export PDF | ~5 บาท | นักเที่ยวทั่วไป |
| **Pro** | **฿199/เดือน** (฿1,990/ปี) | AI สร้างทริป 30 ครั้ง + อากาศไม่จำกัด (แฟร์ยูส 300), ทริปกลุ่ม 5 คน | ~20 บาท | คนเที่ยวบ่อย/ครอบครัว |
| **Business (B2B)** | **฿2,900/เดือน** | white-label, template บริษัท, สมาชิก 20 คน, support LINE | ~100 บาท | บริษัททัวร์ |

หลังหักเกตเวย์ (สมมติจ่ายรายเดือนผ่านบัตร Stripe): Starter เหลือ ~79 − (2.88+10) ≈ **฿66**, Pro เหลือ ~199 − (7.26+10) ≈ **฿182**

### Break-even (สมมติต้นทุนคงที่ ฿3,500/เดือนที่ขั้น Growth)
- ขาย Starter อย่างเดียว: 3,500 ÷ 66 ≈ **53 คน**
- ผสม (70% Starter / 25% Pro / 5% Business): รายได้เฉลี่ย/คน ≈ 0.7×66 + 0.25×182 + 0.05×2,700 ≈ **฿227** → break-even ≈ **16 คนจ่ายเงิน**
- Free→Paid conversion ปกติ 2–5%: ต้องมี active ~400–800 คนก่อนถึงจุดคุ้มทุน → ตรงกับแผน SEO + template (Phase 2)

### กฎเหล็กการเงิน
1. **โควต้าต้อง enforce ในโค้ดก่อนเปิดขาย** (ไม่งั้น user ฟรี 1 คนยิง AI หมื่นครั้ง = ขาดทุน)
2. รายปีลด churn + เงินสดล่วงหน้า — ดันรายปีด้วยส่วนลด 2 เดือน
3. B2B ปิดการขายเอง 2–3 เจ้าแรก (ไม่ต้องรอ product สมบูรณ์)

## KPI ประจำ phase
- P0: uptime ≥99.5%, backup restore เทสผ่าน, PDPA docs ครบ
- P1: activation (สมัคร→สร้างทริปแรกใน 24 ชม.) ≥30%, AI สร้างทริปสำเร็จ ≥80%
- P2: organic traffic โต 20%/เดือน, template duplicate ≥100/เดือน
- P3: conversion ≥2%, churn รายเดือน <8%, CAC payback <6 เดือน

## ความเสี่ยงสูงสุด 3 ข้อ
1. **พึ่ง Gemini เจ้าเดียว** (โดนปลดโมเดลมาแล้ว 2 รอบ) → ต้องมี fallback model + แคช
2. **ไม่มี moat** — ฟีเจอร์หลัก (แพลนทริป+อากาศ) ก็อปง่าย → moat คือ template/UGC ภาษาไทย + B2B (Phase 2–3)
3. **ทำทุกอย่างพร้อมกัน** → ลำดับบังคับ: P0 → AI สร้างทริป → ขาย (อย่าข้าม)

## AI — BYOK และงานเบื้องหลัง (แผนอนาคต)
- [ ] ผู้ใช้เชื่อม API key ของ project ตนเอง แยกค่าใช้จ่าย/โควตาจาก key กลาง ดู [AI_BYOK_PLAN.md](docs/AI_BYOK_PLAN.md)
- [ ] Durable worker/checkpoint เพื่อปิดหน้าแล้วงานยังทำต่อ พร้อมตรวจภาพรวมเส้นทางและงบทั้งทริป

- [x] UI AI และจุดตกหล่นทุกหน้ารองรับ 4 ภาษา พร้อมเลือกภาษา AI request/cache — docs/I18N_AUDIT.md
