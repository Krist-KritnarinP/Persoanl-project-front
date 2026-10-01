# Landing page + SEO — 2026-09-26

## เปิดดูในเครื่อง
รัน `npm run dev` ใน PersonalProject_Front แล้วเปิด `http://localhost:5173/`
- `/` = public Landing page แม้ login อยู่ก็เปิดได้
- `/login` = Login เดิม พร้อม Google/Forgot Password
- ผู้ที่ login แล้วกด CTA จะไป `/dashboard`; ผู้ที่ยังไม่ login ไป `/login`
- แผนที่ส่วนตัวและข้อมูลทริปยังอยู่หลัง auth ตามเดิม; Landing ไม่เรียก API/AI/map tiles

## เนื้อหาและการออกแบบ
ครีม/เขียวเข้ม, mountain postcard SVG ใน repo, infographic 9 กลุ่มพร้อมคำอธิบายสั้น, ตัวอย่างทริปเชียงใหม่สลับ 3 วัน, ขั้นตอนเริ่มต้น, FAQ และ CTA
รองรับ TH/EN/ZH/KO และธีมสว่าง/มืด ใช้ preference เดียวกับแอป ภาพทั้งหมดเป็นตัวอย่างอธิบายการใช้งาน ไม่ใช่ข้อมูลทริปจริงหรือราคา booking
แสดงฟีเจอร์ที่มีจริง: AI ช่วยร่าง/แก้แพลนรายวัน, หมุด/Google Maps/QR, สถานที่ใกล้เคียง 1–5 กม., เชิญผู้ร่วมทริป/สิทธิ์/แจ้งเตือน, เพื่อน/แชท/แชร์พิกัดตามเวลาที่อนุญาต, หารบิล, อากาศ AI/บันทึกเองระดับวันและกิจกรรม, ภาพรวมแผนที่/ปฏิทิน/ค่าใช้จ่าย, ลิงก์แชร์อ่านอย่างเดียว
มีหมายเหตุให้ตรวจข้อมูล AI ก่อนเดินทาง และข้อมูลสถานที่ใกล้เคียงไม่ใช่อันดับรีวิว ไม่อ้าง PDF, booking หรือจำนวนผู้ใช้ที่ไม่มีหลักฐาน
- `src/landing/FeatureGallery.jsx`: ภาพ SVG + semantic figure/caption ทั้ง 9 กลุ่ม
- `src/landing/featureCopy.js`: ข้อความสั้น/ป้ายในภาพ/meta ทั้ง 4 ภาษา เชื่อมผ่าน `copy.js`
- `src/landing/feature-gallery.css`: responsive grid และสีอิงธีม

## หน้า Login: ฉากหมาเดินทาง (2026-10-01)
ใช้หมา SVG ตัวเดียวกับ Loading ผ่าน `TravelingDog.jsx` ฉากภูเขา/เส้นทางใน `LoginJourney.jsx` และการจัดหน้าใน `pages/Login.css`
หมาเดินไปกลับวนด้วย CSS ไม่ดาวน์โหลด GIF/video; ฉากเป็น decorative (`aria-hidden`, `pointer-events: none`) มีปุ่มพัก/เล่น และหยุดอัตโนมัติตาม `prefers-reduced-motion` รวมข้อความหมุนในฟอร์ม
ฟอร์มบนมือถืออยู่ถัดจากภาพหมา; desktop วางฟอร์มขวา รองรับ light/dark ระบบ login/register/Google/recovery เดิม

## SEO ที่ทำ
- title/description/Open Graph ใน index.html, heading structure, semantic HTML, skip link, focus styles, local SVG ไม่มี remote image tracker
- ตอน `npm run build` ใช้ React renderToStaticMarkup สร้างเนื้อหา Landing ภาษาไทยใน HTML จริงก่อน JavaScript ทำงาน
- CSS Landing อยู่ใน initial CSS จึงเปิดอ่าน HTML ได้โดยไม่รอ client rendering; ฝั่ง browser render ปุ่มสลับวัน/ภาษาเพิ่ม
- runtime title/description เปลี่ยนตามภาษา; root canonical ตั้งจาก VITE_SITE_URL เท่านั้น
- ถ้าไม่มี VITE_SITE_URL: noindex + robots Disallow ทั้งหมด ไม่มี fake domain/sitemap
- เมื่อตั้ง HTTPS public origin: build สร้าง canonical, og:url, robots.txt และ sitemap.xml เฉพาะหน้าแรก
- Login/recovery มี static entry แบบ noindex; private/share URLs มี client noindex และ X-Robots-Tag config สำหรับ host ที่รองรับ _headers/vercel.json
- robots/noindex ไม่ใช่การตรวจสิทธิ์ และไม่ใช้แทน API authorization
- ตอนนี้มี URL ภาษาไทยหลักเดียว การสลับภาษาเป็น client preference ยังไม่ได้ทำ multilingual URLs/hreflang

อ้างอิง: [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) และ [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

## Checklist เมื่อจะเปิดเว็บจริง (ยังพัก deploy)
- [ ] กำหนดโดเมนจริงแล้วตั้ง frontend `VITE_SITE_URL=https://your-domain` ไม่มี path/query
- [ ] `npm run build` + `npm run test:seo` ใหม่หลังตั้งค่า
- [ ] ตั้ง host ให้เสิร์ฟไฟล์ static ก่อน SPA fallback, รองรับ refresh `/login`, และนำ X-Robots-Tag/security headers ไปใช้จริง
- [ ] ตรวจ View Source ว่ามี h1/เนื้อหา Landing และ canonical เป็นโดเมนจริง; auth/private/share ต้อง noindex
- [ ] เพิ่ม social preview image หากต้องการภาพในลิงก์แชร์ (รอบนี้มี OG title/description ยังไม่มี raster OG image)
- [ ] ยืนยัน Google Search Console และส่ง `/sitemap.xml` หลังเผยแพร่จริง
- [ ] ตรวจ URL Inspection/real mobile performance และค่อยเพิ่ม URL แยกภาษา/hreflang หากทำ SEO หลายภาษา

ไม่จำเป็นต้องตั้ง Google/SMTP เพื่อดู Landing; การ login Google/ส่งเมลยังใช้ checklist ใน API docs/AUTH_SETUP.md
ไม่มีการ deploy/push/เปลี่ยน DB ในงาน Landing นี้ และยังไม่อ้างว่าเว็บถูก Google จัดทำดัชนีแล้ว

## ตรวจสอบ
`npm test`, `npm run lint`, `npm run build`, `npm run test:seo`, `npm run test:e2e`
Browser coverage: desktop/mobile, CTA, sample day toggle, FAQ, 4 languages, no horizontal overflow, no API calls on Landing, auth redirect, Google linking and password recovery เดิม
ไฟล์ภาพตรวจงานอยู่ใน test-results (ไม่ commit)

ผลรอบเริ่มต้น: unit 6 ผ่าน, browser 8 ผ่าน, build และ SEO checks ทั้ง configured/unconfigured domain ผ่าน; lint 0 errors/8 warnings เดิม

รอบภาพเคลื่อนไหว/infographic 2026-10-01: unit 14 ผ่าน, build และ static SEO ผ่าน; lint 0 errors/9 warnings เดิม ตรวจ browser desktop/mobile ครอบคลุม auth เดิม, loading, animation pause/reduced motion, infographic 9 กลุ่มและข้อความ 4 ภาษาไม่ล้น ภาพตรวจงานอยู่ใน test-results (ไม่ commit)

## ปรับ readability ตาม feedback
ข้อความ charcoal/เทาเข้ม หัวข้อเน้นน้ำตาลอุ่น เนื้อหาประมาณ 16–18px และมือถือใช้ feature cards คอลัมน์เดียว สีเขียวเหลือเป็นสีประกอบ/ปุ่ม; ตรวจ browser 4 กรณีและภาพ desktop/mobile ผ่าน
