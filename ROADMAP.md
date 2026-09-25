# ROADMAP — จาก MVP สู่โปรดักชันที่เก็บเงินได้จริง

> สถานะปัจจุบัน (2026-09-25): MVP ใช้งานได้ (CRUD ทริป/วัน/กิจกรรม, AI พยากรณ์อากาศ, แชร์ลิงก์, 4 ภาษา)
> แต่ **ยังไม่พร้อม** รับ user จริง/เก็บเงิน — ขาด: ระบบจ่ายเงิน, โควต้า, กฎหมาย PDPA, monitoring, AI สร้างทริป (ปุ่มยัง disabled)
> ไฟล์นี้คือ task list แบ่ง phase + โมเดลสเกล + แพ็กเกจขาย

## Phase 0 — Production Readiness (2–3 สัปดาห์) ⛔ ทำก่อนรับ user จริง

**Security & Reliability**
- [ ] เปิด Supabase backups (Point-in-Time) + ทดสอบ restore 1 ครั้ง
- [ ] แยก `DATABASE_URL` (pooler) / `DIRECT_URL` (direct) ให้ถูก role — วันนี้ใช้ user `postgres` เจ้าของ DB ตรง ๆ (**เสี่ยง**: คีย์หลุด = โดนยึด DB) → สร้าง role สิทธิ์จำกัดสำหรับแอป
- [ ] หมุน `JWT_SECRET` ให้ยาว ≥32 ตัวอักษร + เพิ่ม refresh token (วันนี้ access token 1 วัน ไม่มี refresh)
- [ ] ล็อกเวอร์ชัน `GEMINI_MODEL` + ทำ model fallback (เช่น 3.8-flash → 3.5-flash-lite) กันโมเดลถูกปลดอีก
- [ ] แคชผลพยากรณ์อากาศรายทริป (เช่น 6 ชม.) — วันนี้กดทุกครั้ง = เสียโควต้า/เงินทุกครั้ง
- [ ] Error tracking (Sentry self-host/GlitchTip) + uptime monitor (Uptime Kuma/Better Stack)
- [ ] สำรอง rate-limit ราย user ที่เส้น AI (วันนี้ limit รวมต่อ IP — user คนนึงเผาโควต้าทั้งระบบได้)

**Legal (ไทย)**
- [ ] Privacy Policy + Terms of Service (ภาษาไทย) — บังคับตาม PDPA
- [ ] Cookie consent banner
- [ ] ช่องทางลบข้อมูล/ส่งออกข้อมูล (PDPA right to erasure/portability) — มี `DELETE user` cascade อยู่แล้ว ต่อ UI ให้ user กดเองได้
- [ ] จดทะเบียนพาณิชย์อิเล็กทรอนิกส์ (ถ้ารับเงิน) + ออกใบกำกับภาษีได้

**Ops**
- [ ] CI: `npm run build` + `prisma validate` ทุก push (GitHub Actions)
- [ ] แยก env `staging` / `production` (วันนี้มีชุดเดียว)
- [ ] ตั้ง budget alert ฝั่ง Google AI (กันบิลพุ่ง)

## Phase 1 — Core Value & Activation (3–4 สัปดาห์)

> เหตุผล: ฟีเจอร์ที่ทำให้คน "ว้าวแล้วอยู่ต่อ" ยังไม่เสร็จ — ปุ่ม AI สร้างทริปยัง disabled
- [ ] **AI สร้างทริปอัตโนมัติ** (input: จุดหมาย/วัน/งบ/สไตล์ → ได้ Trip+Days+Activities) — นี่คือ killer feature
- [ ] คำนวณงบประมาณรวมจริง (มี `price` ทุก activity แล้ว แค่ sum + แสดง)
- [ ] Onboarding: ทริปตัวอย่าง + ทัวร์ 3 ขั้นตอนตอนสมัครครั้งแรก
- [ ] Landing page + SEO (แต่ละภาษา) — วันนี้เข้าเว็บเจอหน้า login เลย คนใหม่ไม่รู้ว่าคืออะไร
- [ ] PWA (install ได้, icon, offline หน้าอ่านทริป) — นักเดินทางใช้บนมือถือกลางทาง
- [ ] แจ้งเตือนก่อนเดินทาง (email/LINE OA): เช็กลิสต์ + อากาศล่วงหน้า 3 วัน
- [ ] Import/Export: ส่งออก PDF/พิมพ์แผนทริป, แชร์เป็นรูป
- [ ] **รูปภาพประกอบทริป**: อัปโหลดรูปต่อ activity/day (Supabase Storage มีอยู่แล้ว) → โชว์ใน timeline + หน้า share — ตาราง `trip_photos` (id, activityId?, dayId?, storagePath, caption)
- [ ] **Export PDF แผนเที่ยว**: ปุ่ม "ดาวน์โหลด PDF" ใน `/trips/:id` — ทำฝั่ง server (`GET /api/trips/:id/pdf`, ใช้ puppeteer/chromium บน server หรือ pdf-lib ประกอบเอง) ได้ไฟล์สวยพร้อมโลโก้/วันที่/งบรวม ไม่เสียค่า AI เพราะข้อมูลมีครบแล้ว; แคชไฟล์ 24 ชม.

## Phase 2 — Growth & Retention (4–6 สัปดาห์)

- [ ] Template ทริปสาธารณะ (เช่น "ไอซ์แลนด์ 9 วัน" ที่มีอยู่แล้ว) → user กด duplicate เป็นของตัวเอง
- [ ] Public gallery + รีวิว/ให้ดาว template (UGC loop: ยิ่งแชร์ยิ่งมีคนเข้า)
- [ ] Referral: ชวนเพื่อนได้โควต้า AI เพิ่ม
- [ ] ทริปกลุ่ม (multi-user collaborate — วันนี้ 1 user = 1 ทริป)
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
