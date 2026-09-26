# Handover — Landing page + SEO (2026-09-26)

- ตามคำสั่งล่าสุดทำ Landing ก่อน; Export PDF พักไว้ ยังไม่มี implementation/dependency ของ PDF
- ทำใน PersonalProject_Front เดิม: หน้าแรก `/` เป็น Landing; Login ย้าย `/login` พร้อมแก้ auth guard, recovery links และ 401 redirect
- ดีไซน์ cream/forest green พร้อม SVG postcard, ฟีเจอร์ 5 ส่วน, demo ทริปสลับวันได้, FAQ, CTA และ 4 ภาษา
- Landing ไม่ยิง API/AI/geocoding; ผู้มี session กด CTA ไป dashboard ส่วน guest ไป login
- Build prerender เนื้อหา Landing ภาษาไทยลง HTML, meta/OG, optional real-domain canonical/robots/sitemap, noindex auth/private routes
- ไม่มี VITE_SITE_URL จะ noindex ไว้ก่อน; checklist การเปิด SEO จริงและข้อจำกัดอยู่ [docs/LANDING_SEO.md](docs/LANDING_SEO.md)
- ตรวจภาพ desktop/mobile; build ผ่าน, unit 6 ผ่าน, browser 8 ผ่านรวม auth regression; static SEO checks ผ่านทั้งมี/ไม่มีโดเมน; lint 0 errors/8 warnings เดิม
- อัปเดต ROADMAP และ API auth setup ให้ชี้ `/login`; ไม่แก้ backend logic/DB/secrets และไม่ deploy/push
- เริ่มดู: npm run dev → http://localhost:5173/ ; login เดิม http://localhost:5173/login

---
## บันทึกรอบก่อน

# Handover — Phase 0 + Google/Forgot Password ใน Front เดิม (2026-09-26)

ทำงานใน `PersonalProject_Front` ที่ใช้ npm run dev จริง คู่กับ `PersonalProject_API` ไม่ใช้ monorepo backup

- หน้า Login `/` มี Google DaisyUI fallback และ Forgot Password เสมอ; ตั้ง Client ID แล้วใช้ GIS button จริง
- เพิ่ม `/forgot-password`, `/reset-password` เข้าถึงได้แม้มี login ค้าง; reset token รับจาก fragment แล้วล้าง URL
- Google ชนบัญชีเดิมเปิด dialog ยืนยันรหัสผ่าน ก่อนเชื่อม; token Google เก็บใน memory ไม่บันทึก localStorage
- Refresh interceptor/cookie, single-flight/Web Locks, account export/delete ใน profile และข้อความ 4 ภาษา
- คงโค้ด map/TripMapPage/TripsActivity เดิม ไม่คัดลอก snapshot เก่าทับ
- Unit 6 ผ่าน, build ผ่าน, lint 0 errors/8 warnings เดิม, Playwright desktop/mobile 4 ผ่าน พร้อมตรวจ screenshot เห็นปุ่มครบ
- Browser tests mock API/Google; ยังไม่รับรอง OAuth/mail จริงจนตั้งค่าตาม checklist
- API สำรองและเพิ่ม schema ใน DB เดิมแล้ว; ข้อมูล mockup เดิมอยู่ครบตาม row-count checks
- Checklist ที่ต้องทำ: [AUTH_SETUP](../PersonalProject_API/docs/AUTH_SETUP.md)
- Phase 0 งานภายนอกที่ค้าง: [OPERATIONS](../PersonalProject_API/docs/PHASE0_OPERATIONS.md) และ ROADMAP
- Restart `npm run dev` ใน Front และ API หลังตั้ง env; เข้า `http://localhost:5173/` และ logout หาก login อยู่
- Commit โค้ด/tests/docs ใน repo นี้; ไม่ push ไม่ deploy

---
## บันทึกรอบก่อน (ประวัติ ไม่ใช่สถานะล่าสุด)

# HANDOVER — AI LHOUNG Travel Planner

## สถานะใช้งานล่าสุด: ย้อน setup deploy กลับมาใช้ 2 repos เดิม

- ผู้ใช้ขอพักและย้อน setup deploy: ใช้ `PersonalProject_Front` คู่กับ `PersonalProject_API` เท่านั้น
- Frontend application code คงที่ commit `5f2e488`; การกลับชุดเดิมไม่ต้อง reset เพราะงาน monorepo/deploy/auth ใหม่ไม่ได้แก้ source ใน repo นี้
- ย้าย `AIlhongdeploy` และ worktree `AIlhongdeploy-phase0` ไป `/Users/kritnarinp/Desktop/Codecamp_23/_AI_LHOUNG_BACKUP_2026-09-26/` พร้อม Git history และ repair worktree links แล้ว
- Google Login/Forgot Password และ Phase 0 ของ monorepo พักไว้ใน backup ไม่ใช่ฟีเจอร์ใน repo ที่ใช้งานนี้
- รัน `npm run dev` ภายใน repo นี้สำหรับ frontend และภายใน `PersonalProject_API` สำหรับ API ดูคำสั่ง/checklist ใน `../START_HERE.md`
- ไม่เปลี่ยน `.env`, ฐานข้อมูล, ข้อมูลทริป หรือ remote services; GitHub/Render/Vercel เดิมยังไม่ได้ลบ/ปิด ไม่ push รอบนี้เพื่อหลีกเลี่ยง deployment
- ตรวจสถานะ Git, scripts, source ของสอง repos และ git diff --check; เปลี่ยนเฉพาะเอกสาร ไม่รัน tests ที่เชื่อม DB

เอกสารส่งมอบงานสำหรับ dev คนต่อไป / คน deploy / คนสอบ
อัปเดตล่าสุด: 2026-09-26 (รอบ 12: ปุ่ม dashboard ใน overlay แผนที่เต็มจอ)

> **สถานะล่าสุด:** แก้ security หลักและ performance แล้ว ดูหัวข้อ 5.8 และ [SECURITY_REVIEW.md](SECURITY_REVIEW.md) ก่อน deploy ยังต้องตรวจ hosting/HTTPS/backup/monitoring จริง ส่วนหัวข้อเก่าเป็นประวัติงาน ไม่ใช่ config ปัจจุบัน

## 1. Repo Structure (2 repos แยกกัน)

```
Personal project  AI/
├── PersonalProject_Front/  → https://github.com/Krist-KritnarinP/Persoanl-project-front.git (branch main)
│   ├── src/
│   │   ├── api/mainApi.js      # axios baseURL จาก VITE_API_URL + JWT interceptor + 401 auto-logout
│   │   ├── routes/AppRouter.jsx # / , /dashboard, /userprofile, /trips, /trips/:tripId, /trips/:tripId/map (ใหม่)
│   │   ├── pages/ Login, Dashboard, TripsActivity, TripMapPage (ใหม่), ShareTripView, Userprofile
│   │   ├── components/ UserTrip, DayModal, ActivityModal(+ช่อง lat/lng+ปุ่มค้นหาพิกัด), ActivityItem, TripInfoCard, GeminiWeatherCard, TripMap (ใหม่), TripNavCard (ใหม่)
│   │   ├── utils/ geocode.js (ใหม่: Photon+Nominatim+cache+save-back), gmaps.js (ใหม่: ลิงก์ Google Maps)
│   │   ├── stores/ userStore(authState+register), tripStore, tripActivityStore
│   │   └── validations/schema.js
│   ├── PROJECT_CONCEPT.md / HANDOVER.md
│   ├── .env.example            # VITE_API_URL
│   └── vite.config.js          # alias @ -> ./src
│
└── PersonalProject_API/    → https://github.com/Krist-KritnarinP/Persoanl-project-Back.git (branch main)
    ├── src/
    │   ├── app.js              # helmet + rate-limit + CORS(จาก FRONTEND_URL) + mount routes
    │   ├── server.js
    │   ├── routes/ auth, users, trips, days, activities, weather(+history)
    │   ├── controllers/ auth, users, trips, days, activities, weather(Gemini + retry)
    │   ├── services/ user, trips, days, activities, ai(ใหม่)
    │   ├── middlewares/ auth.middleware(Bearer+expired), errorHandler, pathNotfound
    │   └── validations/schema.js # register/login/weather(+tripId)
    ├── src/generated/prisma/  # ⚠️ Prisma client ถูก commit อยู่ใน repo (ตั้งใจ — deploy ไม่ต้อง generate; แก้ schema แล้วต้อง generate ใหม่ก่อน commit)
    ├── prisma/schema.prisma   # provider=postgresql: User, Trip, Day, Activity(+latitude/longitude ใหม่), AiMessage
    └── .env.example
```

## 2. Prerequisites
- Node.js 20+
- Supabase Postgres (ไม่ต้องรัน DB เองแล้ว)
- Gemini API Key

## 3. Setup & Run

### 3.1 Backend
```bash
cd PersonalProject_API
npm install
# ก็อป .env.example เป็น .env แล้วใส่ค่าจริง (รหัสผ่าน Supabase ต้อง URL-encode ถ้ามี @ # ? / :)
npx prisma generate
npx prisma db push
npm run dev   # -> http://localhost:8899
```

`.env` ที่ต้องมี:
```env
PORT=8899
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://... (pooler/direct + รหัส encode แล้ว)
DIRECT_URL=postgresql://... (direct 5432 สำหรับ migrate)
JWT_SECRET="xxx"
GEMINI_API_KEY="xxx"
GEMINI_MODEL=gemini-3.8-flash
```

เช็ก: `GET http://localhost:8899/check` → `Hello`

> ⚠️ กับดักที่เจอจริง:
> 1. รหัสผ่าน Supabase มี `@` ทำให้ connection string เพี้ยน (P1001) — ต้อง encode (`@`→`%40`)
> 2. ถ้าแก้โค้ดแล้วผลไม่เปลี่ยน ให้เช็ก process ค้าง `lsof -i :8899` (เคยมี server ตัวเก่าจับ port อยู่)

### 3.2 Frontend
```bash
cd PersonalProject_Front
npm install
npm run dev    # http://localhost:5173
npm run build  # ✅ ผ่านแล้ว (1.8s) → serve dist/
```
ค่า API URL มาจาก `VITE_API_URL` (default `http://localhost:8899/api`)

## 4. API Contract (แนบ JWT ทุกเส้นยกเว้น auth)

| Method | Endpoint | Auth | Note |
|---|---|---|---|
| POST | `/api/auth/register` | - | username, email, password → 201 (ไม่คืน password hash แล้ว) |
| POST | `/api/auth/login` | - | email+password → `{token, user{id,username,email}}`, ผิด → 401 `Invalid email or password` |
| GET/PUT | `/api/users/me` | Y | PUT แก้ username/รหัสผ่านแยกกันได้ (ไม่บังคับส่งคู่) |
| GET/POST | `/api/trips` | Y | ทริปของ user (startDate/endDate ที่ user กรอกเป็นหลัก) |
| GET/PUT/DELETE | `/api/trips/:tripId` | Y | GET พร้อม days+activities, DELETE cascade |
| POST | `/api/trips/:tripId/days` | Y | Day 1 ต้องมี dayDate, Day ถัดไป auto +1 วัน |
| PUT/DELETE | `/api/days/:dayId` | Y | mount ใต้ `/api` (แก้ path ชนกันแล้ว) |
| POST/PUT/DELETE | `/api/activities[/:activityId]` | Y | มีเช็ก ownership ถึง trip; POST/PUT รับ `latitude/longitude` (optional, เก็บพิกัดหมุดแผนที่) |
| POST | `/api/weather/predict-weather` | Y | รับ `tripId?` → บันทึกประวัติ, retry เฉพาะ 500/502/503 (**ห้าม retry 429** เดี๋ยวเผาโควต้า), โควต้าหมด → 429 ข้อความไทย → `{prediction, model, messageId}` |
| GET | `/api/weather/history/:tripId` | Y | (ใหม่) ประวัติคำตอบ AI ของทริป (มี `createdAt` = วันที่กด) |
| DELETE | `/api/weather/history/:messageId` | Y | (ใหม่) ลบประวัติ 1 รายการ (เช็ก ownership) |
| POST | `/api/trips/:tripId/share` | Y | (ใหม่) เปิดแชร์ลิงก์ → `{shareToken}` (มีอยู่แล้วคืน token เดิม) |
| DELETE | `/api/trips/:tripId/share` | Y | (ใหม่) ปิดแชร์ลิงก์ |
| GET | `/api/shared/:token` | - | (ใหม่) **public** ดูทริปแบบ read-only (ไม่คืน userId, มี `sharedBy`) — หน้าบ้าน `/share/:token` |

Auth: `Authorization: Bearer <token>` (จาก `localStorage.authState.state.token`), token หมดอายุ → 401 `token expired`, หน้าบ้าน auto-redirect หน้า login

## 5. งานที่ทำไปแล้ว (รอบ 2026-09-25)

**Database:** MySQL/MariaDB → Supabase Postgres (`@prisma/adapter-pg`+`pg`), ตาราง `users/trips/days/activities` + ใหม่ `ai_messages(kind/model/prompt/content)` — ทุกตารางเปิด RLS แล้ว (Data API เรียกไม่ได้, แอปต่อตรงด้วย owner ไม่กระทบ)

**AI:** สาเหตุที่ใช้ไม่ได้ = โมเดล `1.5/2.x-flash` ถูก Google ปลด (404) → เปลี่ยนเป็น `gemini-3.8-flash` (เทสยิงจริงผ่าน) + retry กัน spike 429/503 + แยก error โมเดลถูกปลดโดยเฉพาะ

**Security:** auth middleware เช็ก `Bearer`+token หมดอายุ, ห้ามรหัสผ่านหลุดลง response/log, error login รวมเป็นข้อความเดียว (กัน enumerate user), helmet + rate-limit (auth 100/15นาที, AI 30/10นาที), body limit 100kb, CORS จาก env

**Frontend:** ลบโค้ดตาย ~1500 บรรทัด, `Userprofile` ทำจริง, การ์ดงบประมาณแสดงวันเดินทางรวมจริง (เลิก mock), ปุ่ม AI สร้างทริปเป็น `เร็วๆ นี้` (เลิกหลอก), รูป `public/image/MiniDog.PNG` path เดียว, เพิ่ม Day (แก้/ลบ) กลับมา, เวลาเก็บแบบ UTC กันเพี้ยน +7

**Docs/config:** `.env.example` 2 ฝั่ง, `.gitignore` กัน `.env*`/`*.bak`, `HANDOVER.md` ฉบับนี้

## 5.1 งานรอบ 2 (2026-09-25 บ่าย)

**AI timeout:** สาเหตุ `timeout of 15000ms` = axios default 15s แต่ Gemini ตอบ ~19s → เส้น predict ขอ timeout 120s โดยเฉพาะ + ข้อความแยกกรณี timeout ("AI ตอบช้าเกินกำหนด กรุณากดใหม่อีกครั้ง")

**ประวัติ AI:** ใช้ตาราง `ai_messages` (มีแล้วรอบก่อน) + เพิ่ม `DELETE /history/:messageId` (เช็ก ownership, เทสแล้ว: ลบผ่าน, ลบซ้ำได้ 404) — หน้าบ้าน `GeminiWeatherCard` โชว์ประวัตพร้อมวันเวลาที่กด + ปุ่มลบ

**i18n 4 ภาษา:** `src/i18n/index.jsx` (ไทย/อังกฤษ/จีน/เกาหลี, ~100 keys, fallback ไทย) + `LanguageSwitcher` ใน navbar ทุกหน้า + วันที่ตาม locale — จำไว้ใน `localStorage.lang`

**Typography:** คง theme liquid-glass เดิม, base 16px + ฟอนต์ Noto Sans Thai (+fallback จีน/เกาหลี), ลบ class ผิด (`text-s`, `btn-s`, `text-[10px]`) — ข้อความจิ๋วอัปเป็น `text-xs/sm/base` หมด

**Overview:** แถบสถิติใน `/trips/:id` (จำนวนวัน/กิจกรรม/งบรวม/ช่วงวันที่) + timeline เดิม — Dashboard มีสถิติอยู่แล้ว

**Responsive:** navbar เป็น `rounded-3xl` บนมือถือ, โลโก้/อีเมลย่อ, search ซ่อน < lg, stats 2 คอลัมน์บนมือถือ, คอลัมน์ทริปเรียง Plan → Timeline → Weather บนจอเล็ก, modal เต็มจอบนมือถือ (`npm run build` ผ่าน)

## 5.2 งานรอบ 3 (2026-09-25 เย็น)

**สาเหตุ 502 รอบใหม่:** ไม่ใช่บั๊ก — โควต้า Gemini free tier หมด (`429 quota exceeded`, ลิมิต 20 req) → แก้: เลิก retry 429 (ตอบ 429 ตรงๆ ใน 0.8s ไม่เผาโควต้า), ข้อความไทยชัดเจน, หน้าบ้านแปลข้อความโควต้าหมดตามภาษาที่เลือก (`weather.quota`) — ถ้าเจออีก = รอโควต้ารีเซ็ต/อัปเกรดแพ็กเกจที่ ai.google.dev

**ภาพรวมแบบ scrollbar:** แถบสถิติทริปเป็นแนวนอน scroll-snap บนมือถือ (grid 4 คอลัมน์บน desktop) + เพิ่ม overview ระดับวันในการ์ด Day (จำนวนกิจกรรม/งบวันนั้น/วันที่)

**ภาษา dropdown:** `LanguageSwitcher` เปลี่ยนจากปุ่ม 4 ปุ่มเป็น `<select>` dropdown (ประหยัดที่ navbar มือถือ)

**Human-made + ฟอนต์:** คงสี/theme เดิม, base 16px→17px, ฟอนต์ display `Sriracha` (ลายมือ, รองรับไทย) ใช้กับโลโก้ + หัวข้อ hero ทุกหน้า

## 5.3 งานรอบ 4 (2026-09-25 ค่ำ)

**Overview scroll ทุกจอ:** แถบสถิติเป็น horizontal scroll-snap strip ทุก breakpoint (เดิม `lg:overflow-visible` ทำให้ desktop เลื่อนไม่ได้)

**ลด motion (เว็บอืด):** สาเหตุหลัก = `background-attachment: fixed` + `filter: blur(18px)` บน `.glass::before` ทุกการ์ด + backdrop-blur 24px → แก้: bg เหลือ 2 gradients + attachment scroll, ตัด blur ใน ::before, glass blur 24→18px, เอา spin ไร้สาระออก — หน้าตาใกล้เคียงเดิม

**⚠️ กับดัก route order (เจอตอนทำ share):** `DaysRoute` mount ใต้ `/api` พร้อม `authCheck` ดักทุก request ที่ขึ้นต้น `/api/*` ทำให้ route public โดน 401 หมด — แก้โดย mount `/api/shared` **ก่อน** `/api` (มีคอมเมนต์เตือนใน `app.js` แล้ว)

**Share link (view-only):** DB เพิ่ม `trips.share_token` (unique, nullable) → เจ้าของกดแชร์ได้ token (base64url 43 ตัว) → คนมีลิงก์เปิด `/share/:token` ดูได้โดยไม่ login (ซ่อนปุ่มแก้ไข + ซ่อน weather ประหยัดโควต้า) → ยกเลิกได้ (ลิงก์เดิมใช้ไม่ได้ทันที) — เทสแล้ว: public GET ผ่าน/ไม่รั่ว userId, token มั่วได้ 404, revoke แล้วเข้าไม่ได้, auth เดิมไม่พัง

## 5.4 งานรอบ 5 (2026-09-25 ดึก)

**⚠️ กับดัก CSS (สาเหตุ timeline ล้นไม่มี scroll):** `.glass{overflow:hidden}` เขียนแบบ unlayered จึงชนะ overflow-* utilities ของ Tailwind (layered) เสมอ → `lg:overflow-y-auto` ไม่เคยทำงาน + class `custom-scrollbar`/`scrollbar-none` ถูกใช้แต่ไม่เคยนิยามไว้ — แก้ใน `index.css`: เพิ่ม opt-out rules (`.glass.overflow-y-auto` ฯลฯ) + นิยาม scrollbar ทั้งสองแบบ

**Timeline scroll ทุกจอ:** คอลัมน์ภาพรวมล็อกความสูง (`62vh` มือถือ / `70vh` แท็บเล็ต / `100vh-2rem` desktop) + scroll แนวตั้งมีแถบให้เห็น — modal แชร์/DayModal กันล้นจอเล็กด้วย (`max-h-85vh` + scroll)

## 5.4 งานรอบ 6 (2026-09-25 ดึก)

**Activity dropdown มี icon:** `<select>` ธรรมดาใส่ icon ไม่ได้ → เปลี่ยนเป็น custom dropdown (ปุ่ม + เมนู) มี icon + สีตามประเภท + ติ๊กถูกอันที่เลือก

**ภาษาใส่ธง:** dropdown ภาษาโชว์ธง 🇹🇭🇬🇧🇨🇳🇰🇷 ทั้งในกล่องและ options

**badge Trip#:** เลิกใช้ `badge` (padding เพี้ยนข้อความล้น) → pill `inline-flex items-center` จัดกลางจริง

**แท็บ Overview หน้าสุด:** แถบ Day มีปุ่มภาพรวมอันแรก (default) → panel สรุปรายวัน (กดเข้าวันนั้นได้) — เลิก auto-select วันแรก

**Modal ดูข้อมูล:** `DetailModals.jsx` — กดที่การ์ด activity ดูป๊อปอัปอ่านอย่างเดียว (มีปุ่มแก้ต่อ) + ปุ่ม 👁 ที่หัว Day ดูสรุปวันพร้อมรายการกิจกรรม

**Perf รอบ 2:** จอ <768px ตัด backdrop-blur/เงากระจก/shine ปุ่ม/focus-scale ออก (desktop เหมือนเดิม) — การ์ดใช้พื้นขาวโปร่งแทน

## 5.4 งานรอบ 7 (2026-09-25 ดึก)

**ธงเดี่ยว:** เอาธงหน้ากล่องออก เหลือธงแค่ในรายการตัวเลือก (เดิมโชว์ 2 ธงซ้อน)

**Modal อ่านง่าย:** `DetailModals` เปลี่ยนจากพื้นกระจก (ตัวหนังสือกลืนพื้นหลัง) เป็นพื้นขาวทึบขอบเท่าสไตล์เดียวกับ ActivityModal + แถวกิจกรรมพื้น `slate-50`

## 5.5 งานรอบ 8 (2026-09-25 แผนที่)

**ของฟรีที่ใช้:** Leaflet + OpenStreetMap (2D) + Esri World Imagery (satellite, สลับชั้นมุมขวาบน) — ไม่ต้องใช้ API key ทั้งหมด (`npm i leaflet react-leaflet qrcode.react`)

**Backend:** `Activity` เพิ่ม `latitude/longitude` (nullable) → `npx prisma db push` แล้ว → `activities.service` รับ/แก้พิกัดได้ → shared-trip API ส่งพิกัดออกด้วย

**Frontend:**
- `TripMap` (กล่องเล็กใต้สภาพอากาศ, `height=220 compact`) หมุดเลขสีตามประเภท + เส้นเส้นทาง เปลี่ยนตามแท็บ Day ปุ่มขยายลิงก์ไปหน้าเต็ม (หน้า share ไม่มีลิงก์ ใช้ modal เดิม)
- `TripNavCard` (ใต้แผนที่เล็ก) QR เส้นทางทั้งวัน + ปุ่มเปิด Google Maps + ปุ่ม "เลือกจุดเอง" ไปหน้าแผนที่
- หน้าเต็ม `/trips/:tripId/map` (`TripMapPage`, ต้อง login): แท็บวัน + ติ๊กเลือกจุดด้วย +/✓ (default ติ๊กทุกจุด = เส้นทางทั้งวัน) จุดที่ไม่เลือกจางลง QR/ปุ่มนำทางอัปเดตตามจุดที่เลือก สูงสุด 10 จุด (โควตา URL Google Maps)
- `ActivityModal` มีช่อง lat/lng + ปุ่มค้นหาพิกัดจากชื่อ; i18n เพิ่ม `map.*` 4 ภาษา; `index.css` มี fix z-index Leaflet

## 5.6 งานรอบ 9 (2026-09-25 optimize แผนที่ช้า)

**สาเหตุช้า:** เดิม geocode ผ่าน Nominatim ตัวเดียวแบบต่อคิว 1.1 วิ/จุด ทริป 27 จุด ≈ 30 วิ + รอครบทุกจุดค่อยวาดหมุด

**แก้ 4 ชั้น (`src/utils/geocode.js`):**
1. DB ก่อนเสมอ + **save-back**: หน้าของเจ้าของทริป (`persistCoords`) ยิง `PUT /activities/:id` เก็บพิกัดที่หาได้แบบ fire-and-forget → เปิดครั้งต่อไปแทบจะทันที (หน้า share ไม่เซฟ เพราะ read-only)
2. **dedupe** ชื่อซ้ำ (เช่น โรงแรมเดิมนอน 2 คืน) เหลือ 1 request
3. **Photon (komoot) เป็นตัวหลัก ยิงขนาน 5 ตัว** (~1 วิ/จุด → 15 ชื่อจบใน ~3-4 วิ) + Nominatim เหลือเป็น fallback เฉพาะจุดที่ Photon หาไม่เจอ
4. **progressive render**: `onProgress(snapshot)` วาดหมุดทีละจุดที่ได้ ไม่รอครบ + การ์ดแผนที่โชว์หมุดทันทีที่มี (เหลือ spinner เล็ก "กำลังค้นหา (n)")

## 5.7 ผลตรวจ Security (2026-09-25)

ตรวจโค้ดจริงทั้ง frontend/backend แล้ว พบว่ามี ownership check, bcrypt, JWT จำกัด algorithm, Helmet, CORS และ rate limit บางเส้นทาง รวมถึง token แชร์สุ่มและยกเลิกได้ อย่างไรก็ตาม ยังต้องแก้ก่อนเปิด public ดังนี้:

- [ ] ยืนยันรหัสเดิมก่อนเปลี่ยนรหัสผ่าน และเพิกถอน session/token เก่าหลังเปลี่ยนรหัสผ่าน
- [ ] เพิ่มความแข็งแรงของรหัสผ่าน (ปัจจุบันขั้นต่ำ 4 ตัว) และใช้ JWT secret production แบบสุ่มอย่างน้อย 32 bytes
- [ ] ซ่อน error ภายในจาก response และกรองข้อมูลอ่อนไหวใน log
- [ ] เพิ่ม validation ครบทุก Trip/Day/Activity รวม ID, วันที่, ราคา, ความยาวข้อความ และพิกัด
- [ ] ตรวจสิทธิ์ทริปก่อนเรียก AI เพิ่มโควต้ารายบัญชี/เพดานทั้งระบบ และจำกัดการสร้าง/อ่านข้อมูล
- [ ] แยก role ฐานข้อมูลสำหรับ runtime ออกจาก role สำหรับ migration (config เครื่องที่ตรวจใช้บัญชี postgres)
- [ ] ประเมิน JWT ใน localStorage และตั้ง frontend security headers/CSP
- [ ] แก้ API `.gitignore` ให้กัน `.env.local`/`.env.production` ด้วย โดยยกเว้น `.env.example`

**หลักฐาน:** frontend build ผ่าน; ทดสอบด้วย mock ยืนยันว่าเปลี่ยนรหัสผ่านได้โดยไม่ถามรหัสเดิม, JWT เก่ายังตรวจลายเซ็นผ่าน, schema รับรหัสผ่าน 4 ตัว และ error handler ส่งรายละเอียด error กลับจริง การทดสอบนี้ไม่แตะฐานข้อมูลจริงและยังไม่ได้เพิ่ม regression test ลง repo

**ขอบเขต:** ยังไม่ได้ทำ penetration test, dependency vulnerability audit หรือยืนยัน HTTPS/backup/สิทธิ์ DB บน hosting จริง ต้องทดสอบสิทธิ์ข้ามบัญชีและเกณฑ์ใน [SECURITY_REVIEW.md](SECURITY_REVIEW.md) ก่อนเปิดใช้งานสาธารณะ

## 5.8 รอบ 10 — Performance และ Security (2026-09-26)

### สาเหตุแผนที่ช้าและการแก้ไข

- เดิม `mapPool` รอ Photon ทุกจุดก่อน emit; เปลี่ยนเป็นส่งผลจาก worker ทันที และรวม state update ทุก 80 ms
- หน้าเต็มเดิมซ่อนแผนที่เมื่อ `geoLoading`; ตอนนี้แสดง DB/cache/หมุดที่พบก่อนทันที ไม่รอจุดช้า
- มี request timeout 6 วินาทีและงบเวลาต่อรอบ 15 วินาที, abort ตอนออกหน้า, แชร์ request ชื่อเดียวกัน และจำกัด worker 2 ตัว
- cache ใน memory/localStorage สูงสุด 500 รายการ; ผลสำเร็จ 30 วันและไม่พบ 5 นาที; ไม่อ่าน/เขียน localStorage ต่อหมุด
- ใช้ `useTripCoordinates` ร่วมสามหน้า ข้อมูล popup ใช้ activity ปัจจุบัน ไม่ค้างจากการแก้ชื่อ/คำอธิบาย
- ยกเลิก Nominatim fallback อัตโนมัติ: บริการ public จำกัดรวมทั้งแอป 1 req/s ไม่ใช่ต่อ browser และเดิม fallback ทำให้คิวยาว
- ใช้ Photon-compatible URL ผ่าน `VITE_GEOCODE_URL`; public demo ไม่มี SLA ควรเปลี่ยน provider เมื่อมีผู้ใช้มาก
- ยกเลิก automatic fire-and-forget PUT พิกัดทุกจุด เพื่อไม่เขียนทับการแก้ไขระหว่างค้นหา/ยิง write ซ้ำ พิกัดที่ค้นหาอัตโนมัติอยู่ใน cache; การค้นหา/กรอกแล้วบันทึกผ่าน ActivityModal ยังเก็บลง DB
- แผนที่ไม่ animate fit ทุกหมุด และหยุด auto-fit หลังผู้ใช้ลาก/zoom; ลด tile buffer และ cache marker icons
- ถ้าค้นหาไม่ครบภายในกำหนด แสดงจุดที่มีและข้อความให้แก้พิกัดในกิจกรรม ไม่ค้าง spinner

### หน้าเว็บ

- แยก route เป็น lazy chunks; entry JS จาก 764.72 KB เหลือประมาณ 227.84 KB ก่อน gzip (ไม่ใช่ขนาดรวมทุก chunk)
- หน้า login/dashboard ไม่โหลด Leaflet; ลด blur ซ้อนในการ์ด/ปุ่ม/input ทุกขนาดจอ และตัด shine/floating animation
- แก้ชื่อ import `Userprofile` ให้ตรงตัวพิมพ์สำหรับ Linux และใช้ `import.meta.dirname` ใน Vite config
- รายการทริปแบ่งหน้า 100 รายการและดึงเฉพาะวันที่/ลำดับวัน; frontend โหลดต่อเมื่อมี nextPage

### Security ที่แก้แล้ว

- JWT อายุ 1 ชั่วโมงพร้อม `tokenVersion`; เปลี่ยนรหัสผ่านต้องยืนยันรหัสเดิม และเพิ่ม version แบบมีเงื่อนไขป้องกัน race
- `POST /api/users/logout` เพิกถอน token ทุกเครื่องของบัญชี; frontend ล้าง state หลัง server ยืนยัน
- รหัสผ่านใหม่ขั้นต่ำ 15 ตัวและไม่เกิน 72 UTF-8 bytes; bcrypt cost 12; บัญชีเดิมยัง login ได้
- validation Trip/Day/Activity/ID, วันที่ ราคา และพิกัด; body schema ไม่รับ field แปลกปลอม
- error 5xx เป็นข้อความกลางและ log เฉพาะ request ID/status/code ไม่ log request หรือ Prisma error ทั้งก้อน
- AI ตรวจเจ้าของก่อนเรียก และใช้ข้อมูลทริปจาก DB; cache คำตอบ 6 ชั่วโมงเมื่อ itinerary ตรงกัน; timeout 25s, output สูงสุด 1500 tokens, ไม่มี automatic retry
- quota AI เก็บใน `ai_usage` และ transaction/advisory lock: 10 ครั้ง/บัญชี/วัน, 100 ครั้งทั้งระบบ/วัน (ตั้ง env ได้), 2 ครั้ง/บัญชี/นาที; นับ attempts แม้ provider ล้มเหลว ลบประวัติไม่คืนโควต้า
- จำกัดสร้าง 100 trips/บัญชี, 60 days/trip, 100 activities/day ใน transaction; rate limit API รวมและ share; ตัด auth ซ้ำที่ DaysRoute
- `TRUST_PROXY_HOPS` default 0 ต้องตั้งตาม reverse proxy จริง; production ปฏิเสธ secret สั้น/placeholder และ FRONTEND_URL ที่ไม่ใช่ HTTPS
- migration เพิ่ม `users.token_version`, ตาราง `ai_usage` พร้อม RLS และ index วันที่ AI; **apply กับ DB ที่เครื่องนี้ใช้อยู่แล้ว**
- สร้าง role `ailhoung_runtime` ที่ไม่มี DDL/จัดการ role และเปลี่ยน local DATABASE_URL แล้ว; policy อนุญาตเฉพาะ trusted backend role ส่วนการแยกผู้ใช้ยังอยู่ที่ API ไม่ได้เปิดให้ Supabase anon/authenticated
- สุ่ม local JWT secret ใหม่แล้ว **ผู้ใช้เดิมต้อง login ใหม่**; เก็บ owner DIRECT_URL สำหรับ migration แยก ห้ามใช้ใน runtime production
- `.gitignore` กัน `.env*` ยกเว้น example; frontend มี Vercel headers และ `_headers`/`_redirects` สำหรับ host ที่รองรับ ต้องตรวจว่า host จริงนำไปใช้
- อัปเดต Prisma/client/adapter เป็น 7.10.0 ตรงกัน; overrides `deepmerge-ts` 8.0.0 และ `mysql2` 3.24.4 เพื่อปิด advisory ใน Prisma tooling; validate/generate ผ่าน

### วิธีอัปเดต environment อื่น

1. Backup DB แล้วใช้ owner `DIRECT_URL` รัน `npm run migrate:security` (additive/idempotent สำหรับ schema ที่มีอยู่ ไม่ใช่สร้าง DB ใหม่)
2. `npm ci` และ `npx prisma generate`; schema มี generated client commit ตามเดิม
3. ตั้ง runtime role แยกจาก owner; `npm run security:runtime-role` ใช้ครั้งเดียวเพื่อสร้าง role และเขียน local .env หยุดหาก role มีอยู่แล้ว อย่ารันซ้ำเพื่อ rotate โดยไม่ตรวจ
4. ตั้ง `DATABASE_URL`, `JWT_SECRET` ใหม่ที่สุ่มอย่างน้อย 32 bytes, `FRONTEND_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`, `TRUST_PROXY_HOPS` ตาม host และ AI limits
5. Runtime ใช้ `npm start`; frontend ตั้ง `VITE_API_URL=https://<api-domain>/api` แล้ว build ใหม่

### การตรวจยืนยัน

- Backend `npm test`: 7 tests ผ่าน; frontend `npm test`: 4 tests ผ่าน
- API integration สองบัญชีจริงผ่าน: CRUD, validation, ownership, share/revoke, password change และ logout revocation; สร้างข้อมูลชั่วคราวแล้วลบเฉพาะที่สร้าง ไม่มีการเรียก Gemini
- `prisma validate`, `prisma generate` และ frontend production build ผ่าน
- หลังปรับ dependencies: npm install audit ฝั่ง API รายงาน 0 vulnerabilities; frontend production dependency audit 0
- Browser/performance smoke และสถานะ repo ดูบันทึกส่งมอบล่าสุดที่ท้ายไฟล์

### ข้อจำกัดที่ยังต้องดูแล

- JWT ยังอยู่ localStorage; CSP ลดความเสี่ยงแต่ไม่ทำให้ token ปลอดภัยหากเกิด XSS ยังไม่ได้ย้ายเป็น HttpOnly cookie
- rate limit ต่อ IP ใช้ memory ต่อ process; quota AI ใช้ DB ร่วมแล้ว หากเพิ่มหลาย instance ควรใช้ shared store สำหรับ auth/global IP limit
- ไม่มี password breach/blocklist, email verification หรือ recovery flow ใหม่ในรอบนี้
- ไม่มีการ deploy hosting หรือทดสอบ restore/monitoring จริง และไม่ได้ยืนยันความแม่นยำ/ความเร็ว public geocoder บนเครือข่ายผู้ใช้

## 6. TODO ที่เหลือ (ยังไม่ทำ)
- [x] มี automated regression tests และ integration smoke แล้ว (ดูหัวข้อ 5.8)
- [x] แยก route chunks แล้ว entry JS ประมาณ 227.84 KB ก่อน gzip
- [ ] ฟีเจอร์ `AI สร้างทริป` ยังเป็นปุ่ม disabled (รอ backend)

## 7. Deploy Checklist
- [ ] ตรวจข้อจำกัดที่เหลือในหัวข้อ 5.8 และผ่านเกณฑ์ก่อนเปิด public ใน [SECURITY_REVIEW.md](SECURITY_REVIEW.md)
- [ ] ตรวจ HTTPS, proxy/rate limit, CORS, frontend headers, secret และ dependency บนสภาพแวดล้อมที่จะ deploy
- [ ] ทดสอบสิทธิ์ด้วยสองบัญชี, token revocation, public share และ backup restore บน staging
- [ ] ตั้ง env หลังบ้าน: `DATABASE_URL, DIRECT_URL, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, FRONTEND_URL, PORT`
- [ ] DB เดิม: `npm run migrate:security` ด้วย owner DIRECT_URL; อย่าใช้ db push ด้วย runtime role
- [ ] ตั้ง `VITE_API_URL` หน้าบ้านเป็น domain API จริง แล้ว `npm run build`
- [ ] ห้าม commit `.env` / `.env*.bak` (ignore แล้ว) — `src/generated/prisma` ตั้งใจ commit ไว้
- [ ] อย่าเอา Supabase anon/service key มาใช้ฝั่ง front (ไม่จำเป็น)

## 8. Demo Script (3 นาที)
1. Login → Dashboard (search + สถานะทริป)
2. สร้างทริป → เข้า `/trips/:id` → เพิ่ม Day + Activity
3. กด `ทำนาย` อากาศ AI → ประวัติถูกเก็บ (`GET /history/:tripId`)
4. แก้โปรไฟล์ `/userprofile` → Logout


## Final verification — 2026-09-26

- Frontend tests: 4 passed; backend tests: 7 passed.
- Real database integration: two-account isolation, CRUD, validation, share/revoke, password and logout session revocation passed using the limited runtime role. Temporary test records removed. No paid AI requests made.
- Production build passed. Entry JS is 227.87 kB (70.76 kB gzip), compared with the earlier 764.72 kB entry. Other route/shared chunks load separately; this is not the total page download size.
- Chromium desktop/mobile smoke: progressive pins, lazy map bundle, password confirmation field, no horizontal overflow or page errors. Synthetic geocoder test showed first two pins in approximately 0.5 seconds while a third lookup was delayed 8 seconds; this is not a real provider latency benchmark. Map tiles were mocked/blocked, so live tile delivery was not measured.
- Fixed CSS prefix ordering after browser testing revealed production CSS still enabled blur. Added map resize observation and reset viewport when switching day.
- Dependency audits at time of work: backend full audit and frontend production audit reported zero known vulnerabilities. This is not a penetration-test guarantee.
- Combined publication folder: `../AIlhongdeploy`, with `frontend/` and `backend/`. Original repositories and their histories remain intact. The new repo is a snapshot, not merged Git histories.
- Deployment has NOT been performed. Follow the combined root README for environment variables, database initialization and hosting settings. Existing local users must log in again following the JWT secret rotation.

## Commit — 2026-09-26 (รอบ 10+11)

- งานค้างรอบ security hardening + แผนที่ (tokenVersion, AiUsage, runtime role scripts, lazy routes, geocode, SECURITY_REVIEW.md) ถูก commit ครบทั้ง 2 repos แล้ว ยังไม่ push

## 5.5 งานรอบ 11 (2026-09-26)

**กลับ dashboard จากแผนที่:** โลโก้ AI LHOUNG ใน header ของ `/trips/:id/map` และ `/trips/:id` กดแล้วไป `/dashboard` (เดิมกดไม่ได้ กลับได้แค่หน้าทริป)

**AI log ข้อมูลที่ส่งออก:** backend log `[AI weather] outgoing: {model, tripId, location, start, end, days, activities, promptChars}` ที่ terminal ทุกครั้งที่ยิง Gemini (ไม่มี API key) + หน้าบ้าน log request payload ที่ browser console

**Prompt สรุปทั้งทริป:** เลิกสั่ง "ไม่เกิน 20 คำ" → สั่ง AI ตอบ 2 ส่วนคั่นด้วย `---DETAILS---`: (1) ไฮไลต์ภาพรวม ≤6 บรรทัด (2) รายวัน `Day N (วันที่)` + แต่ละที่สรุปเช้า/กลางวัน/เย็น ที่ย่อยเอาแค่ไฮไลต์ — ส่งรายวันแบบ `Day N (date): ที่1, ที่2` ให้โมเดลแทน JSON ดิบ

**การ์ดอากาศแบบกล่อง scroll + modal:** กล่องสรุปล็อก `max-h-44` + scroll (ไม่ยืดตามตัวอักษร) ปุ่มดูรายละเอียดทั้งหมดเปิด modal พื้นทึบ — ใช้กับทั้งผลล่าสุดและประวัติ (ถ้า AI ไม่คืน marker จะโชว์ข้อความเต็มเหมือนเดิม)

**⚠️ หมายเหตุเทส:** predict จริงติด rate-limit รวมต่อ IP (30 ครั้ง/10 นาที, แชร์กันทั้ง localhost) และโควต้า Gemini free tier — กดปุ่มรัวๆ จะโดน 429 เอง ไม่ใช่บั๊ก

## 5.6 งานรอบ 12 (2026-09-26)

**ทางกลับ dashboard จาก overlay แผนที่เต็มจอ:** overlay (`TripMap` modal `z-[1000]`) เดิมมีแค่ปุ่ม X ปิด — เพิ่มปุ่ม dashboard (ไอคอนบ้าน + `nav.dashboard` 4 ภาษา) ไป `/dashboard` ได้จากทุกที่ที่เปิด overlay

## 5.7 งานรอบ 13 (2026-09-26)

**ปุ่ม dashboard ชัดๆ ในหน้าแผนที่เต็ม:** โลโก้กดได้อาจสังเกตยาก → เพิ่มปุ่ม dashboard (ไอคอนบ้าน + ข้อความ) ข้างปุ่มย้อนกลับใน `/trips/:id/map` โดยตรง
**หมายเหตุ:** ถ้ากดแล้วเด้งไปหน้า login แสดงว่า token หมดอายุ/ถูกเพิกถอนหลัง rotate JWT secret — ให้ login ใหม่ ไม่ใช่บั๊กปุ่ม; ถ้าเทสตัว deploy เก่าให้ rebuild/refresh ก่อน

## 5.8 งานรอบ 14 (2026-09-26)

**ปุ่มย้อนกลับหน้าแผนที่เต็มไป dashboard:** ตามรีเควส — ปุ่มย้อนกลับบน `/trips/:id/map` ไป `/dashboard` โดยตรง (ปุ่ม "กลับหน้าทริป" ด้านล่างคงเดิมสำหรับย้อนกลับทริป)

## 5.9 งานรอบ 15 (2026-09-26)

**Back chain ตายตัวทีละสเตป:** `/trips/:id/map` → `/trips/:id` → `/dashboard` (ไม่พึ่ง browser history — เปิดลิงก์ตรงมาก็ย้อนถูก): ปุ่มย้อนกลับหน้าแผนที่ไปหน้าทริป, ปุ่มย้อนกลับหน้าทริปไป dashboard (เลิกใช้ `navigate(-1)` ที่เข้าผิดที่ถ้าเปิดลิงก์ตรง)

## 5.10 งานรอบ 16 (2026-09-26)

**ทางออกจาก overlay แผนที่ (หน้า share):** overlay เดิมมีแค่ X เล็กๆ + ปุ่ม dashboard ที่ส่งคนไม่ได้ login ไปติดหน้า login — เพิ่มปุ่มย้อนกลับชัดๆ (ปิด overlay กลับภาพรวมทริปทันที) + ปุ่ม Esc + โชว์ปุ่ม dashboard เฉพาะคน login แล้ว (ไม่ได้แตะโค้ด AI weather ตามที่ขอไว้)

## 5.11 งานรอบ 17 (2026-09-26)

**overlay กดปุ่มไม่ออกแต่ Esc ออกได้:** สาเหตุคือ overlay อยู่ใต้ `.glass` ที่มี transform/backdrop-filter ทำให้ `position: fixed` ถูกขัง relative กับกรอบการ์ด + event ปุ่มโดนรบกวน — แก้โดยย้าย overlay ไป `document.body` ด้วย React Portal (fixed เต็มจอจริง ไม่โดน ancestor บัง) + เหลือปุ่มเดียว (ย้อนกลับ) ตามที่ขอ

## 5.12 งานรอบ 18 (2026-09-26)

**Prompt ประหยัด token (~78%):** ตัด JSON ดิบ 32 รายการทิ้ง ใช้รายวันกระชับ `D2 10-18: TG954(00:05), Muli(นอน)` (วันที่ MM-DD, เวลา HH:MM, ที่นอนต่อท้าย) — ทริปไอซ์แลนด์เหลือ ~1,185 ตัวอักษรจาก 5,439
**ไฮไลต์ตามทริป:** ปิดท้ายสรุปด้วย ★ + ปัจจัยอากาศที่กระทบแผนทริปนั้นมากสุด ให้ AI เลือกเอง (แสงเหนือ/พายุ/ฝน แล้วแต่ทริป ไม่ hardcode)
**แก้บั๊กเวลา:** `activityTime` จาก Prisma เป็น Date object ไม่ใช่ string — เวลาเลยหายหมด แก้ fmtT แล้ว (เทส: 00:05/13:50/16:30/18:00 ถูก)
**เทส:** syntax + dry-run prompt ผ่าน; ยิงจริงติด rate-limit รวม (เทสทั้งวัน) — รอ window รีเซ็ตแล้วกดทำนายจากหน้าบ้านได้เลย
