# Landing page + SEO — 2026-09-26

## เปิดดูในเครื่อง
รัน `npm run dev` ใน PersonalProject_Front แล้วเปิด `http://localhost:5173/`
- `/` = public Landing page แม้ login อยู่ก็เปิดได้
- `/login` = Login เดิม พร้อม Google/Forgot Password
- ผู้ที่ login แล้วกด CTA จะไป `/dashboard`; ผู้ที่ยังไม่ login ไป `/login`
- แผนที่ส่วนตัวและข้อมูลทริปยังอยู่หลัง auth ตามเดิม; Landing ไม่เรียก API/AI/map tiles

## เนื้อหาและการออกแบบ
ครีม/เขียวเข้ม, mountain postcard SVG ที่ทำใน repo, ฟีเจอร์ 5 ส่วน, ตัวอย่างทริปเชียงใหม่สลับ 3 วัน, ขั้นตอนเริ่มต้น, FAQ และ CTA
รองรับ TH/EN/ZH/KO ใช้ preference เดียวกับแอป แผนตัวอย่าง/งบไม่ใช่ราคา booking จริง ภาพอากาศบน postcard เป็น illustration
แสดงฟีเจอร์ที่มีจริง: itinerary, map pins, budget, AI weather, read-only sharing; ไม่อ้างว่ามี automatic AI trip generation, PDF หรือรีวิว/จำนวนผู้ใช้ที่ไม่มีหลักฐาน
PDF ถูกพักตามคำสั่งล่าสุด ยังไม่ได้ติดตั้ง PDF library หรือแก้ backend สำหรับ export

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

ผลรอบนี้: unit 6 ผ่าน, browser 8 ผ่าน, build และ SEO checks ทั้ง configured/unconfigured domain ผ่าน; lint 0 errors/8 warnings เดิม
