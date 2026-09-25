# HANDOVER — AI LHOUNG Travel Planner

เอกสารส่งมอบงานสำหรับ dev คนต่อไป / คน deploy / คนสอบ
อัปเดตล่าสุด: 2026-09-25 (รอบ 2: ซ่อม AI timeout, ประวัติ AI + ลบได้, i18n 4 ภาษา, typography, overview, responsive)

## 1. Repo Structure (2 repos แยกกัน)

```
Personal project  AI/
├── PersonalProject_Front/  → https://github.com/Krist-KritnarinP/Persoanl-project-front.git (branch main)
│   ├── src/
│   │   ├── api/mainApi.js      # axios baseURL จาก VITE_API_URL + JWT interceptor + 401 auto-logout
│   │   ├── routes/AppRouter.jsx # / , /dashboard, /userprofile, /trips, /trips/:tripId
│   │   ├── pages/ Login, Dashboard, TripsActivity, Userprofile (ทำจริงแล้ว ไม่ใช่ placeholder)
│   │   ├── components/ UserTrip, DayModal, ActivityModal, ActivityItem, TripInfoCard, GeminiWeatherCard
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
    ├── src/generated/prisma/  # ⚠️ Prisma client ถูก commit อยู่ใน repo (ตั้งใจ — deploy ไม่ต้อง generate)
    ├── prisma/schema.prisma   # provider=postgresql: User, Trip, Day, Activity, AiMessage(ใหม่)
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
| POST/PUT/DELETE | `/api/activities[/:activityId]` | Y | มีเช็ก ownership ถึง trip |
| POST | `/api/weather/predict-weather` | Y | รับ `tripId?` ด้วย → บันทึกประวัติ, retry 429/503 อัตโนมัติ, ตอบช้า ~20s → `{prediction, model, messageId}` |
| GET | `/api/weather/history/:tripId` | Y | (ใหม่) ประวัติคำตอบ AI ของทริป (มี `createdAt` = วันที่กด) |
| DELETE | `/api/weather/history/:messageId` | Y | (ใหม่) ลบประวัติ 1 รายการ (เช็ก ownership) |

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
