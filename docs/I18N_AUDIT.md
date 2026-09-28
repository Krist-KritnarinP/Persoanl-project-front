# ตรวจภาษา UI และ AI — 2026-09-28

## ปัญหาและสิ่งที่แก้
หน้า AI เดิมมีข้อความไทยเขียนตรงใน JSX และไม่มี LanguageSwitcher; ปุ่ม AI บน Dashboard, day labels, tooltip ธีม/นำทาง, validation/auth errors บางส่วนหลุดระบบภาษา
- รวมคำแปลที่เพิ่มใน src/i18n/additions.js ครบ th/en/zh/ko ใช้ t(key, values) พร้อม placeholder เช่น count/amount
- เพิ่ม switcher บน AI, profile, forgot/reset; เปลี่ยน UI ไม่ล้างค่าฟอร์มหรือเขียนทับข้อมูลทริป/ฉบับร่าง
- Error state/validation ใช้ translation keys เพื่อแสดงตามภาษาปัจจุบัน; ไม่แสดง raw backend message ภาษาอังกฤษแทนข้อความแปล
- Theme/QR/day/modal/navigation และ meta title ของหน้า private ใช้ภาษาเดียวกับหน้า
- Planner และ weather ส่ง language ที่อยู่ใน allowlist ไป backend; default th สำหรับ client เก่า; provider prompt ขอภาษาที่เลือก
- Planner fingerprint แยกภาษาและคง fingerprint ของคำขอไทยเดิม; weather fingerprint รวมภาษา ป้องกัน cache ส่งคำตอบผิดภาษา
- ข้อความ estimate ที่ระบบเติมตอนบันทึกทริปแปลตามภาษาของคำขอด้วย; วัน เวลา ราคา ownership และ transaction ไม่เปลี่ยน

## หน้าที่ตรวจด้วย browser ทั้ง desktop/mobile
| หน้า | จุดตรวจ |
|---|---|
| / Landing | 4-language switch, navigation/theme, ไม่มีข้อความไทยตกค้างเมื่อเลือกภาษาอื่น |
| /login + registration modal | switch, Google/forgot, dictionary + validation keys, auth regression |
| /forgot-password | เพิ่ม switcher, ข้อความส่งอีเมลและ error |
| /reset-password | เพิ่ม switcher, validation, invalid/success/auth regression |
| /dashboard | ปุ่ม AI และข้อความใหม่เปลี่ยนตามภาษา |
| /trips/ai | title/form/placeholder/calendar/notice/error/preview/actions; payload.language; เปลี่ยนภาษาแล้ว draft content ไม่หาย |
| /userprofile | เพิ่ม switcher, profile/account controls และข้อความ feedback |
| /trips และ /trips/:id | day labels และเครื่องมือ; regression edit/share/map |
| /trips/:id/map | day labels/navigation QR/tooltips |
| /share/:token | day labels/QR และ read-only regression |

## หลักฐาน
- ตรวจทุก route ข้างต้น 4 ภาษา ทั้ง desktop/mobile; ตรวจ DOM ว่าไม่มีอักษรไทยตกค้างใน en/zh/ko โดย fixture เนื้อหาทริปเป็นอังกฤษและยกเว้น language selector
- Browser auth/planner/trip/i18n รวม 18 cases ผ่าน; รอบแรก 8 workers บางเคส timeout แล้วรันเฉพาะ failed ด้วย 2 workers ผ่านทั้งหมด
- Front unit 11 ผ่าน รวม translation key parity/placeholder parity และ password validation rules; ไม่มี static t(key) ที่หาคำแปลไม่เจอ
- API unit 30 ผ่าน และเพิ่ม language cache/prompt isolation test ผ่าน รวม 31 cases (ชุด planner rerun หลังเพิ่ม)
- build/SEO ผ่าน; lint 9 warnings เดิม ไม่มี error หรือ warning ใหม่
- ไม่เรียก Gemini/Google/SMTP จริงเพิ่มรอบนี้; provider language ตรวจผ่าน mock prompt และ payload จึงไม่รับประกันว่าโมเดลจะไม่ตอบผิดภาษาเป็นบางครั้ง

## ขอบเขต
ข้อความที่ user กรอกและ AI history/draft ที่สร้างไปแล้วเป็นเนื้อหา ไม่แปลหรือเรียก AI ใหม่โดยอัตโนมัติเมื่อเปลี่ยนภาษา
คำขอ AI ใหม่ใช้ภาษาที่เลือกเมื่อเริ่ม; ทริปที่กำลังร่างต่อใช้ภาษาเดิมจนจบเพื่อไม่ผสมภาษากลางแผน
หน้าต่าง native date/time picker ขึ้นกับ browser/OS; Google sign-in UI ใช้ locale ที่ส่งให้ SDK เดิม
การเพิ่ม UI ครั้งถัดไปต้องมีคำแปลครบ 4 ภาษา อย่า hard-code ข้อความใหม่ใน JSX; ทดสอบ error/empty/loading/preview ไม่ใช่แค่ปุ่มหลัก
