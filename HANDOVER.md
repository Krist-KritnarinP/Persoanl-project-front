# HANDOVER — AI LHOUNG Travel Planner

เอกสารส่งมอบงานสำหรับ dev คนต่อไป / คน deploy / คนสอบ
อัปเดตล่าสุด: 2026-09-25 (รอบ 9: แผนที่ + optimize geocode เร็ว)

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

## 6. TODO ที่เหลือ (ยังไม่ทำ)
- [ ] ไม่มี test อัตโนมัติ / ไม่มี docker — มีแค่เทส manual (รอบ 2: predict→history→delete ผ่าน 2026-09-25)
- [ ] JS bundle 518KB (เตือน code-split) — ยังไม่แตก chunk
- [ ] ฟีเจอร์ `AI สร้างทริป` ยังเป็นปุ่ม disabled (รอ backend)

## 7. Deploy Checklist
- [ ] ตั้ง env หลังบ้าน: `DATABASE_URL, DIRECT_URL, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, FRONTEND_URL, PORT`
- [ ] `npx prisma db push` (ไม่มี migration dir — ใช้ push)
- [ ] ตั้ง `VITE_API_URL` หน้าบ้านเป็น domain API จริง แล้ว `npm run build`
- [ ] ห้าม commit `.env` / `.env*.bak` (ignore แล้ว) — `src/generated/prisma` ตั้งใจ commit ไว้
- [ ] อย่าเอา Supabase anon/service key มาใช้ฝั่ง front (ไม่จำเป็น)

## 8. Demo Script (3 นาที)
1. Login → Dashboard (search + สถานะทริป)
2. สร้างทริป → เข้า `/trips/:id` → เพิ่ม Day + Activity
3. กด `ทำนาย` อากาศ AI → ประวัติถูกเก็บ (`GET /history/:tripId`)
4. แก้โปรไฟล์ `/userprofile` → Logout
