# อ่านโค้ด Frontend เริ่มตรงไหน

ใช้ repo นี้กับ PersonalProject_API ข้างกัน รัน npm run dev แยก terminal; อย่าแก้ใน monorepo สำรอง

## หน้าจอ
| URL | ไฟล์ใน src/pages | หน้าที่ |
|---|---|---|
| / | Landing.jsx | หน้าแนะนำแอป; เนื้อหา/ดีไซน์อยู่ src/landing |
| /login | Login.jsx | Login ด้วยรหัสผ่าน/Google; เปิด UserRegister เพื่อสมัคร |
| /forgot-password | ForgotPassword.jsx | ขออีเมลกู้รหัสผ่าน |
| /reset-password | ResetPassword.jsx | รับ token และตั้งรหัสผ่านใหม่ |
| /dashboard | Dashboard.jsx | รายการทริปและจัดการทริป |
| /trips, /trips/:tripId | TripsActivity.jsx | จัดวัน กิจกรรม งบ แผนที่ย่อ แชร์ และ AI อากาศ |
| /trips/:tripId/map | TripMapPage.jsx | แผนที่เต็ม เลือกพิกัดและลิงก์นำทาง/QR |
| /share/:token | ShareTripView.jsx | อ่านทริปที่แชร์โดยไม่ login; ใช้ public API |
| /userprofile | Userprofile.jsx | ข้อมูลบัญชี รหัสผ่าน export/delete |

## ลำดับการทำงาน
`main.jsx` เปิดแอปและ providers → `App.jsx` วาง router/toast → `routes/AppRouter.jsx` เลือกหน้าและตรวจสถานะ login

ตัวอย่างแก้กิจกรรม: หน้า TripsActivity เปิด ActivityModal → handler ในหน้าเตรียม payload → tripActivityStore เรียก mainApi → API บันทึก → store โหลดทริปใหม่ → component แสดง state ล่าสุด

| โฟลเดอร์/ไฟล์ | ใช้เมื่อ |
|---|---|
| components/ | แก้ส่วนแสดงผลหรือ modal ที่ใช้ในหน้า |
| components/trips/TripOverviewStats.jsx | แสดงสถิติที่หน้าทริปคำนวณไว้ ไม่ fetch เอง |
| components/trips/TripShareModal.jsx | แสดงกล่องแชร์; สร้าง/ลบ token และ clipboard อยู่ที่หน้า |
| components/LoadingScreen.jsx | spinner เต็มหน้า |
| constants/activityTypes.js | icon/สี/ชื่อแปลของประเภทกิจกรรม |
| utils/datetime.js | รูปแบบวันที่ของหน้าทริปเจ้าของและแผนที่ |
| stores/tripStore.js | รายการทริป |
| stores/tripActivityStore.js | รายละเอียดทริป CRUD วัน/กิจกรรม และ weather/share |
| stores/userStore.js | login/logout และ session ที่ persist |
| api/mainApi.js | Axios, access token และ single-flight refresh |
| hooks/useTripCoordinates.js + utils/geocode.js | พิกัด DB → cache → ค้นหาอัตโนมัติ; progressive render |
| utils/gmaps.js | สร้าง URL นำทาง Google Maps |
| theme.js / i18n/index.jsx | ธีมที่ sync ข้ามหน้า/แท็บ และข้อความ 4 ภาษา |
| validations/schema.js | ตรวจข้อมูล form ก่อนส่ง |

## ข้อที่ดูคล้ายกันแต่ห้ามรวมโดยไม่ตรวจ
- ShareTripView ใช้ fallback วันที่/เวลาไม่เหมือน TripsActivity; จึงยังเก็บ formatter ของ share แยก
- ActivityModal มีลำดับ dropdown เฉพาะ อย่าแทนด้วยลำดับ object ใน activityTypes
- เวลา activity เก็บ wall-time ใน UTC; อย่าแปลง timezone เพิ่มเอง
- อย่าเปลี่ยนลำดับ geocode หรือยกเลิก sequence/abort protection เพื่อทำโค้ดสั้น
- รอบ refactor คง CSS, ข้อความ, route และ handlers เดิม; ไม่แก้ warnings ที่จะเปลี่ยนรอบ effect/render

ตรวจงาน: npm test, npm run build, npm run test:seo, npm run lint; browser tests ใช้ API จำลองและไม่ใช่หลักฐานว่า Google/SMTP จริงพร้อม
อ่าน [AGENT_HANDOFF.md](AGENT_HANDOFF.md) ก่อนทำ refactor ต่อ

## AI Trip Planner
ร่างแผนจากข้อความและปฏิทินที่ `/trips/ai`; ดู [AI_PLANNER.md](AI_PLANNER.md) สำหรับ flow, API, ข้อจำกัด และวิธีทดสอบ

## Travel overview
แดชบอร์ดแผนที่/ปฏิทิน/ค่าใช้จ่ายที่ `/travel-overview`; ดู [TRAVEL_OVERVIEW.md](TRAVEL_OVERVIEW.md) สำหรับ data flow และความหมายของสถานะ/ยอดเงิน
