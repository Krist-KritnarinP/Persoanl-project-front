# Agent handoff — รับช่วง refactor 2026-09-27

สถานะ: รับช่วงและทำ refactor รอบนี้เสร็จแล้ว; agent เดิมอ่านเอกสารนี้และ git log/status ก่อนเริ่มงานใหม่

ผู้ใช้ขอรับช่วงงาน agent ที่ token หมด โดยคง frontend/backend behavior เดิม และต้อง commit/handover

จุดรับช่วง: Front HEAD b440ef1 มีงานค้างใน TripsActivity, ThemeToggle, LoadingScreen, constants/activityTypes, utils/datetime และข้อความ HANDOVER รอบ 20; API HEAD 1ebeb3f สะอาด
เก็บงานค้างไว้ทั้งหมด; source ก่อนเริ่มรอบนี้สำรองนอก repo ที่ /private/tmp/ailhoung-refactor-20260927 (ไม่มี .env)

ขอบเขต: ย้ายส่วนแสดงผล/ฟังก์ชันซ้ำที่เหมือนกันจริง, จัดรูปแบบ source, ล้าง comment/debug ที่ไม่ใช้งาน, เพิ่มแผนผังไฟล์และ data flow สำหรับผู้เริ่มต้น
คง route/API response, Prisma schema/DB, token/session, validation, quota/AI prompt, geocode priority DB→cache→auto/manual fallback, theme และเวลาเดิม
ไม่ติดตั้ง dependency ใหม่ ไม่ deploy/push ไม่เรียก AI provider หรือแก้ฐานข้อมูลจริง

agent เดิมไม่ควรทำงานจาก snapshot เก่าโดยไม่อ่าน diff ล่าสุด; ใช้ git log ดู commit ที่มีเอกสารนี้และ HANDOVER.md เป็นหลัก

## ส่งต่อเมื่อจบรอบ
- เก็บงาน agent เดิมครบ รวม HANDOVER รอบ 20 และข้อกำหนด geocode priority
- Front: ใช้ LoadingScreen/activityTypes/date helper ต่อในหน้าที่มี behavior เดียวกัน; แยก TripOverviewStats/TripShareModal แบบ presentation โดย handlers/state ยังอยู่หน้า TripsActivity
- API: รวมเฉพาะ owner-trip list/detail summary ใน services/trip-summary.js; public share whitelist แยกเหมือนเดิม
- จัดรูปแบบ JS/JSX ด้วย Prettier ที่มีอยู่ใน cache ไม่ติดตั้ง dependency และไม่เปลี่ยน CSS/schema/package-lock
- เทียบ normalized AST กับ snapshot รับช่วง: Front 42 ไฟล์และ API 36 ไฟล์มีคำสั่งเดิม; มีการย้ายโครงสร้างโดยตั้งใจ 3 หน้า Front และ trips.service ของ API
- คู่มือผู้เริ่มต้น: [CODE_GUIDE.md](CODE_GUIDE.md) มี route → file → หน้าที่ และ data flow

## ผลตรวจและขอบเขต
- Front unit เดิม 6 ผ่าน + date formatter ใหม่ 1 ผ่าน; API unit หลังจัดรูปแบบ 20 ผ่าน + trip summary ใหม่ 2 ผ่าน
- Front build/SEO ผ่าน; lint ไม่มี errors มี warnings เดิม 9 รายการเท่าตอนรับช่วง (ไม่แก้ effects/ref lifecycle เพื่อรักษาพฤติกรรม)
- Browser เฉพาะ owner/share/map ที่แก้: 4 กรณี desktop/mobile ผ่าน (ทดสอบแยก rerun เฉพาะกรณีที่แก้ test)
- ตรวจ sharing/revoke, แก้วัน, ยอดรวม, pin จาก DB, ธีมข้ามหน้า และ public read-only ด้วย API จำลอง
- ไม่รัน provider จริงหรือ integration DB เพิ่มหลังผู้ใช้ขอลดงานตรวจซ้ำ; ปิด PostgreSQL container ชั่วคราวที่เตรียมแล้ว
- ไม่ได้ยืนยันว่าไม่มีบั๊กทุกกรณี; หลักฐานรอบนี้คือ AST, unit, build และ browser เฉพาะ flow ที่เกี่ยวข้อง
- คงงาน Google/SMTP/deploy/Phase0 ภายนอกที่ยังค้างตามเอกสารเดิม; ไม่ได้เปิดใช้เพิ่มใน refactor

ผู้ใช้กำชับล่าสุด: ทำเท่าที่จำเป็น ไม่สร้าง abstraction/test ซ้ำซ้อน และทำงานความเสี่ยงต่ำถึงปานกลางต่อได้โดยไม่ถามย้ำ
