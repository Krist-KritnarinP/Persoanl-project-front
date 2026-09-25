# AI LHOUNG — Travel Planner Dashboard
### Project Concept

> "นี่ไม่ใช่เครื่องมือกันหลงเธอ แต่ไว้กันหลงทาง"

เว็บแอปวางแผนเที่ยวส่วนตัวแบบ Full-stack แยก Trip > Day > Activity พร้อม AI ช่วยพยากรณ์อากาศรายทริป

---

## 1. Problem & Solution

**Problem:**
- แพลนเที่ยวกระจัดกระจายอยู่ในโน้ต / แชท / Excel
- ไม่รู้ว่าแต่ละวันไปไหน กี่โมง ใช้งบเท่าไหร่
- เช็กอากาศแยกอีกแอป ไม่เชื่อมกับแพลน

**Solution:**
- รวมทริปทั้งหมดใน Dashboard เดียว
- เจาะลึกเป็นรายวัน (Day) + รายกิจกรรม (Activity: ที่พัก / เดินทาง / ร้านอาหาร / ที่เที่ยว)
- กดปุ่มเดียวให้ Gemini AI สรุปอากาศตามสถานที่ + ช่วงวัน + กิจกรรม

## 2. Target User
- นักเดินทางทั่วไปที่วางแผนเอง
- กลุ่มเพื่อน / ครอบครัวที่ต้องแชร์แพลน (phase 2)
- ใช้เป็น Personal Project / Portfolio Full-stack + AI

## 3. Scope (MVP ที่มีแล้ว)

### 3.1 Auth
- Register / Login ด้วย JWT + bcrypt
- Persist session ด้วย Zustand + localStorage (`authState`)
- GuestRoute / ProtectRoute ใน `src/routes/AppRouter.jsx`

### 3.2 Trip (Dashboard `/dashboard`)
- CRUD Trip: `tripName, destination, startDate, endDate, tripDescription`
- Search + Grid/List view
- Status auto: `ร่างแผน / กำลังจะไป / กำลังเดินทาง / จบแล้ว`
- Stats: ทริปทั้งหมด / กำลังจะถึง / จบแล้ว

### 3.3 Day + Activity (`/trips/:tripId`)
- CRUD Day: `dayCount, dayDate, description` → `POST /api/trips/:tripId/days`
- CRUD Activity: `activityType, locationName, activityDate/Time, price, status` → `/api/activities`
- `ActivityType = ACCOMMODATION | TRANSPORT | RESTAURANT | ATTRACTION`
- UI: `TripsActivity.jsx + DayModal.jsx + ActivityModal.jsx + ActivityItem.jsx + TripInfoCard.jsx`

### 3.4 AI Weather
- Flow: Front `GeminiWeatherCard.jsx` → `POST /api/weather/predict-weather` → `weather.controller.js` → Gemini `gemini-3.6-flash`
- Input: `location, startDate, endDate, activities`
- Output: สรุปอากาศสั้น ≤20 คำ แยกเช้า/กลางวัน/เย็น

## 4. Tech Stack

**Frontend (`PersonalProject_Front/`):**
React 19 + Vite, Tailwind v4 + DaisyUI, Zustand 5, React Router 7/8, Axios, React Hook Form + Zod, lucide / react-icons, react-toastify

**Backend (`PersonalProject_API/`):**
Express 5, Prisma 7 + MySQL/MariaDB, JWT, bcrypt, Zod, @google/genai, CORS, dotenv

**Data Model:**
```
User(1) ──< Trip(1) ──< Day(1) ──< Activity
```

## 5. Architecture

```
Front (5173) --axios Bearer JWT--> Back (8899) --> Prisma --> MySQL
   |                                    |
Zustand stores                    Gemini API (weather only)
userStore / tripStore /
tripActivityStore
```

Backend layer: `routes → middlewares/authCheck → controllers → services → prisma`

## 6. User Flow
1. `/` Login/Register → เก็บ token
2. `/dashboard` สร้างทริป → คลิกการ์ด
3. `/trips/:tripId` เพิ่ม Day → เพิ่ม Activity รายวัน
4. กด `ทำนาย` ใน Weather Card → อ่านคำแนะนำก่อนเดินทาง
5. `/userprofile` แก้ username/email

## 7. Non-Goals / Phase 2
- AI auto-generate trip (UI มีช่อง input แล้ว แต่ยังไม่ต่อ API จริง)
- คำนวณงบรวมอัตโนมัติ (ตอนนี้ขึ้น `จ่ายเงินเพื่อปลด`)
- แชร์ทริป / multi-user / upload รูป / map / export PDF
- Payment / Premium

## 8. Success Criteria
- สมัคร-ล็อกอิน-สร้างทริป-เพิ่มวัน-เพิ่มกิจกรรม-ดูอากาศ ได้ end-to-end โดยไม่ error 401/404
- แยกข้อมูลตาม userId ถูกต้อง (ไม่เห็นทริปคนอื่น)
- ลบ Trip แล้ว cascade ลบ Day/Activity

---
อัปเดตล่าสุด: 2026-09-25 | สถานะ: MVP ใช้งานได้ เหลือเก็บงาน AI-trip + budget
