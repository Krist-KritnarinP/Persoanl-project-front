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
| /chat | Chat.jsx | เพื่อน แชทส่วนตัว/กลุ่ม แชร์ตำแหน่ง และลบความสัมพันธ์เพื่อน |
| /notifications | Notifications.jsx | คำขอเป็นเพื่อน/ข้อความใหม่; รับเพื่อนหรือเปิด conversation จาก inbox |
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
| components/LoadingScreen.jsx + LoadingScreen.css | น้องหมาสะพายเป้ระหว่างโหลดหน้า; SVG/CSS, status สำหรับ screen reader และ reduced motion |
| constants/activityTypes.js | icon/สี/ชื่อแปลของประเภทกิจกรรม |
| utils/datetime.js | รูปแบบวันที่ของหน้าทริปเจ้าของและแผนที่ |
| stores/tripStore.js | รายการทริป |
| stores/tripActivityStore.js | รายละเอียดทริป CRUD วัน/กิจกรรม และ weather/share |
| stores/userStore.js | login/logout และ session ที่ persist |
| components/ChatDock.jsx + services/locationTracking.js | floating chat ลากไปตำแหน่งใดก็ได้บนขอบจอและจำพิกัด; อัปเดตตำแหน่งที่ผู้ใช้อนุญาตจนหมดเวลา/หยุดแชร์ |
| layouts/AppLayout.jsx + components/AppDialog.jsx + AppDialogContext.js | โหลด unread count และส่ง notification link ให้ header; AppDialog ใช้ confirm/alert/prompt แบบ theme-aware สำหรับ protected routes |
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

## Shared sidebar (2026-09-28)
`layouts/AppLayout.jsx` เป็น shell ของ protected routes ผ่าน ProtectRoute ใน AppRouter; จัดการ desktop collapse, mobile drawer, settings และ user/logout ด้านล่าง ใช้ Outlet/Suspense คงหน้าลูกและ handlers เดิม
- /travel-overview = ภาพรวม; /dashboard = ทริปของฉัน; /trips/ai = สร้างทริปด้วย AI
- หน้าทริปและ map ยังมีปุ่มเฉพาะทริป ส่วน global navbar ถูกถอดออกแล้ว
- ไม่เพิ่ม sidebar ให้ public/share/auth; อย่าเพิ่ม global header ซ้ำในหน้าลูก
- tests/e2e/helpers/sidebar.js ใช้เปิด navigation/settings ตาม viewport; ปุ่มเลือกภาษาอยู่ใน settings dialog

### ปรับโหมดตามผู้ใช้ (2026-09-28)
Sidebar ปิดแล้วกลับ classic layout เต็ม ไม่ย่อเป็น icon rail: AppLayout เก็บ navigationMode และส่ง sidebarEnabled ผ่าน Outlet context. หน้าลูกแสดง header/ส่วน dashboard เดิมเฉพาะ classic โดยใช้ logic ชุดเดียว. เปิด sidebar กลับด้วยลูกศรเล็กชิดขอบซ้ายบน. Mobile ปุ่ม X ปิด drawer; ปุ่ม “ใช้หน้าตาเดิม” เปลี่ยนโหมดทั้งแอป.

## Trip billing
`pages/TripBilling.jsx` เป็น workspace ของทริป; `components/billing/BillForm.jsx` จัดการฟอร์ม/preview, `SplitEditor.jsx` เลือกวิธีหารและสมาชิก. APIคำนวณเงินจริงและตรวจสิทธิ์; หน้าเว็บไม่ใช่แหล่งยอดเงินที่เชื่อถือได้. ดู HANDOVER ล่าสุดและคู่มือ API docs/BILLING.md ก่อนแก้สูตร

## ผู้ร่วมทริป
เจ้าของเชิญบัญชีที่มีอยู่และเลือก viewer/editor ในหน้า Trip; ผู้รับตอบรับจาก Dashboard. รายละเอียด API, สิทธิ์ และ migration อยู่ใน API `docs/TRIP_COLLABORATION_PLAN.md`.

## Trip sidebar sizing and social UI (2026-09-30)
- `TripsActivity.jsx` ใช้ `.trip-side-column`: ลูกต้อง `flex-shrink: 0` เพราะคอลัมน์จำกัดความสูงและเลื่อนแนวตั้ง; อย่าแก้เฉพาะ wrapping/radius เพราะ `.glass` จะตัดเนื้อหาที่สูงเกินการ์ด
- `TripNavCard.jsx` แยก QR/คำอธิบายกลางการ์ดจากปุ่มเต็มแถว เพื่อรองรับ right column แคบ; ยังใช้ NavigationQr fallback และ URL logic เดิม
- `.social-ui`, `.social-surface`, `.social-hero`, `.chat-messages`, `.notification-row` ใน `src/index.css` จัดสี/ระยะห่างตาม theme เฉพาะหน้า Chat, Notifications และ ChatDock; ไม่ย้าย bell จาก header เดิม
- `trips.spec.js` ตรวจขอบล่างพร้อมขอบซ้าย/ขวาของเนื้อหาที่ 390/1024/1280px; social/notification specs เก็บ screenshots ใน Playwright output เพื่อ review UI
- Chat/Notifications ใช้เต็มความกว้างพื้นที่ content (`w-full`); อย่าเพิ่ม `max-w-* mx-auto` ให้ main เพราะผู้ใช้ต้องการเต็มจอ มีแค่ padding ภายใน

## Trip invitations in notifications (2026-09-30)
`TripInvitations.jsx` ใช้ร่วม Dashboard/Notifications และ poll/focus refresh pending invitations จาก collaboration API เดิม. AppLayout รวมจำนวน pending กับ social unread count และฟัง `trip-invitations-changed` เพื่อ refresh badge หลัง accept/decline. รายการนี้ไม่ใช่ notification rows จึงไม่หายเมื่อกดอ่านทั้งหมด; ไม่ต้อง backfill หรือ migration. Accept/decline ยังคงใช้ PUT `/collaboration/invitations/:tripId` และ API ตรวจ recipient/status เดิม.

LoadingScreen ใช้กับ initial trip/map data loading และ Suspense ของ AppRouter/AppLayout; ข้อความ `loading.journeyTitle/journeyHint` ใน i18n/additions.js. ไม่เพิ่ม timer เพื่อยืดเวลาแสดง loading; ปุ่มที่กำลังบันทึกยังใช้ spinner เดิม.

## Chat workspace UI (2026-10-01)
`pages/Chat.css` is shared by Chat and ChatDock. ConversationPanel keeps location tools in a native details disclosure (closed initially), scrolls messages separately and anchors the multiline composer. Enter submits, Shift+Enter inserts a newline, IME composition must never submit. Room height is bounded; avoid flex shrink/clipping on composer/header. Chat stays full-width; mobile displays conversation before friend management. Group creation is in a separate disclosure. ChatDock refresh is in the header, with existing pointer-drag logic preserved.
