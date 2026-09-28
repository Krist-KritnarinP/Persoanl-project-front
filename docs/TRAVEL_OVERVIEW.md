# Travel overview / ภาพรวมการเดินทาง

## เปิดใช้งาน
เปิดเมนู “ภาพรวม” ใน sidebar → /travel-overview (ต้อง login); โหมด classic มีกล่อง TravelOverviewCard ใต้ AI Trip Assistant บน Dashboard ตามเดิม
- รวมทุกทริป: เลือกผ่านมาแล้ว / อยู่ในช่วงเดินทาง / กำลังจะไป / ยังไม่ระบุวัน
- ปฏิทินรายเดือนแสดงช่วงเริ่มถึงสิ้นสุด รวมวันสุดท้าย; คลิกวันที่กรองทริป แผนที่ และยอดรวม คลิกซ้ำหรือล้างวันที่เพื่อคืนรายการ
- แสดงค่าใช้จ่ายที่บันทึกต่อทริปและรวมตามตัวกรอง กดรายการเปิดหน้าทริปเดิม
- แผนที่ใช้ CircleMarker แยกสีตามวันที่กิจกรรม Popup เปิดทริปได้ ไม่มีเส้นเชื่อมข้ามทริปที่อาจทำให้เข้าใจผิด
- คง th/en/zh/ko, ThemeToggle, responsive และ loading/error/retry/empty states

## ความหมายของข้อมูล
- สถานะจากวันในแผน ไม่ใช่เช็กอินหรือหลักฐานว่าเดินทางจริง เทียบ calendar date ของผู้ใช้ วันสุดท้ายยัง ongoing
- ยอด THB เป็นผลรวม Activity.price อาจมีตัวเลขประมาณการจาก AI ไม่มี payment ledger หรือสถานะจ่ายจริง
- พิกัดใช้ DB เท่านั้น ไม่ geocode เพิ่ม; ข้าม null/นอกช่วง lat/lng และไม่ส่ง description/shareToken/userId
- พิกัดรูปแบบถูกแต่อยู่ผิดประเทศยังแสดงตาม DB (เช่นบางรายการ Trip #2 ที่เคยพบ); ยังไม่มีระบบตรวจยืนยันภูมิศาสตร์
- หากกิจกรรมไม่มีวันที่ หมุดเป็น undated แม้ทริปมีวัน ป้องกันอนุมานว่าไปมาแล้วผิด ๆ
- เลือกวันในปฏิทินเป็นการเลือกทริปที่ครอบคลุมวันนั้น แผนที่แสดงทุกหมุดของทริปที่เลือก

## Code map
Front:
- layouts/AppLayout.jsx: sidebar ทางเข้าหน้าภาพรวมแทนกล่องเดิม
- pages/TravelOverview.jsx: stats/filter/list และประสาน calendar/map
- components/travel/TravelCalendar.jsx: ปฏิทิน 42 ช่อง/เปลี่ยนเดือน
- components/travel/TravelMap.jsx: Leaflet แบบ lazy, สีตามวันที่กิจกรรม, ไม่มีการค้นพิกัดเพิ่ม
- hooks/useTravelOverview.js: โหลด API ทีละหน้าและ abort เมื่อออกจากหน้า ไม่แสดงยอดบางส่วนถ้าโหลดหน้าใดล้มเหลว
- utils/travelOverview.js: date-only comparisons/status/calendar helpers
API:
- GET /api/trips/overview?page=1 อยู่ก่อน /:tripId หลัง authCheck
- controllers/travel-overview.controller.js ตรวจ page 1–1000 ใช้ req.user.id เท่านั้น
- services/travel-overview.js query owner whitelist 20 trips/page, รวมราคาเป็นหน่วยย่อยก่อนหาร100 แล้วคืน compact points
- nextPage เป็น null เมื่อครบ ไม่มี query รายทริปจาก frontend

## Verification / scope
Front unit 13, API unit 35, browser 4 cases (desktop/mobile) ผ่าน; production build ผ่าน; lint ไม่มี error เหลือ 7 warnings เดิม
Browser ใช้ API fixtures และปิด tile network ทดสอบ pagination, card entry, calendar ข้ามเดือน, ตัวกรอง, ยอด, หมุด, 4 ภาษา, error/retry/empty และ mobile overflow; ไม่ได้ยืนยัน availability ของ OSM tiles
API unit ตรวจ owner filter/page bounds ใน query/whitelist รวม decimal และ invalid coordinates; ไม่เรียก DB integration รอบนี้
ไม่เปลี่ยน schema/env/dependency ไม่เรียก AI ไม่แก้ข้อมูลจริง ไม่ deploy/push
