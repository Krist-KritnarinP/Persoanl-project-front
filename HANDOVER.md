# DEPLOY LIVE — อ่านก่อนแตะงาน deploy (2026-10-01)

- Repo ที่ใช้จริงมีแค่ 2 ตัวนี้: `PersonalProject_Front` ↔ GitHub `Krist-KritnarinP/Persoanl-project-front` และ `PersonalProject_API` ↔ GitHub `Krist-KritnarinP/Persoanl-project-Back` ห้ามใช้ `AIlhongdeploy` / `AIlhongdeploy-phase0` (monorepo backup เก่าใน `_AI_LHOUNG_BACKUP_2026-09-26/`) มา deploy เด็ดขาด
- Front อยู่บน **Vercel** project `persoanl-project-front`: `https://persoanl-project-front.vercel.app` — Framework Vite, Build `npm run build`, Output `dist`; `vercel.json` (security headers + SPA rewrite) อยู่ใน repo นี้แล้ว
- API อยู่บน **Render** service `Persoanl-project-Back`: `https://persoanl-project-back.onrender.com` (Singapore, Free; sleep 15 นาที เปิดครั้งแรกช้า ~50 วิ)
- Env ที่ต้องตรงกัน: Vercel `VITE_API_URL` = URL Render + `/api`, `VITE_SITE_URL` = URL Vercel production; Render `FRONTEND_URL` = URL Vercel production (https ไม่มี `/` ท้าย)
- Push ขึ้น `main` แล้ว Vercel/Render auto-deploy เอง (ถ้าไม่ deploy ให้เช็ค Settings ว่า auto-deploy เปิดอยู่); dev ในเครื่องยัง `npm run dev` (Vite 5173) คู่กับ API (8899) ด้วย `.env` localhost เหมือนเดิม

# สถานะล่าสุด — Frontend / Social + Trip collaboration (2026-09-30)

## Signup password usability (2026-10-01)

- `validations/schema.js` minimum is now 8 characters to match API registration/reset/profile changes; 72 UTF-8 byte bcrypt bound remains. Empty/oversized username or email, short password, confirmation mismatch and duplicate email each show a translated, field-level reason. Registration form uses `noValidate` so Zod messages are visible and focuses the first invalid field.
- `PasswordStrength.jsx` shows an advisory 8/12/16-character meter while typing in TH/EN/ZH/KO. Common/repeated patterns remain basic; this is a rough guide, not a guarantee or extra requirement. Eight-character passwords are accepted. Password recovery already exists; external SMTP delivery still needs end-to-end verification.
- Verification: Front unit 15 passed, build/SEO/lint passed (9 existing warnings), desktop/mobile signup/auth browser tests 6 passed. No DB migration or real account was created. See API HANDOVER for server changes. Local commits only; no push/deploy.

## Landing feature heading trimmed (2026-10-01)

- Removed the extra sentence beside the illustrated feature section heading in all languages. The heading now leads directly into the nine illustrated cards, with their captions carrying the specific feature details.
- Removed unused `featureIntro` copy and the now obsolete heading paragraph styles. Verified build, static SEO and landing browser tests (4/4 desktop/mobile); the removed sentence is absent from source and prerendered HTML. Local only; no push/deploy. The unrelated mobile roadmap edit remains unstaged.

## Landing copy made conversational (2026-10-01)

- Rewrote the public landing hero and nine Thai feature captions around concrete trip actions. Removed the self-referential “ดูภาพเดียว ก็รู้ว่าใช้ทำอะไรได้” and redundant “ภาพตัวอย่างการใช้งาน” label. Localized the sample, steps, closing and footer labels in TH/EN/ZH/KO rather than displaying fixed English marketing slogans.
- Illustrations, feature claims, SEO meta, Thai prerender, auth and API logic stay intact. `featureCopy.js` remains the source for the live marketing copy, joined to `copy.js`; the older feature arrays in `copy.js` are still overridden by this source.
- Verified build, static SEO, lint (0 errors, 9 existing warnings), and desktop/mobile landing + visual browser suite (8 passed); reviewed feature screenshots and checked that the removed phrase is absent from prerendered HTML. Local only; no push/deploy. Existing unrelated mobile roadmap edit remains unstaged.

## Travel dog paw direction (2026-10-01)

- Corrected all four paw paths in shared `TravelingDog.jsx`: toes and cream paw markings now face the muzzle instead of the tail. Applies to loading and login; login's whole-character flip keeps paws aligned on the return walk. Animation timing and application logic unchanged.
- Verify: build and loading/welcome-visuals browser checks (6 desktop/mobile cases); inspect generated dog screenshots. Local only; no push/deploy.


## Landing logo consistency (2026-10-01)

- Replaced the landing header/footer compass + star wordmark with the same `/image/MiniDog.PNG` circular image, handwriting font, primary-to-accent text and responsive 40/48px image sizing used by the app header. Removed obsolete landing logo styles; links and app behavior unchanged.
- Build/static SEO and desktop/mobile landing browser checks passed (4 cases). Local only; no push/deploy. Unrelated mobile roadmap edits remain unstaged.


## Login travel dog + visual feature landing (2026-10-01)

- `/login`: reuse the original loading mascot via `TravelingDog.jsx/.css`; `LoginJourney.jsx` draws a muted mountain landscape, dog walks back and forth on a CSS loop. `pages/Login.css` provides desktop/mobile composition in both themes. Pause/play control is translated in all 4 languages; reduced-motion disables the scene and rotating heading animation. Decorative scene ignores pointer input and is hidden from assistive technology.
- Auth handlers/routes, Google linking, registration and recovery remain unchanged. Email/password inputs now have explicit accessible labels and autocomplete.
- `/`: `FeatureGallery.jsx`, `featureCopy.js`, `feature-gallery.css` explain 9 existing feature groups through local SVG diagrams and short captions: AI/manual plan, map/navigation/QR, nearby discovery, collaborators/notifications, chat/timed location, split bills, AI/manual weather, overview/calendar/costs, read-only sharing. Labels/captions/meta support TH/EN/ZH/KO. Examples are labelled; AI verification and nearby-data limitations are explicit.
- All diagrams/captions remain in prerendered Thai HTML; static meta and SEO assertions now cover the expanded feature inventory. No external illustration service, GIF/video dependency or schema/API/DB changes.
- Checks: unit **14 passed**; browser **14 passed** (welcome-visuals, landing, auth, loading; desktop/mobile); build + `test:seo` passed; lint 0 errors / 9 pre-existing warnings; `git diff --check` clean. Reviewed login and feature screenshots including light/dark and mobile. Screenshots remain in ignored `test-results`.
- Docs: ROADMAP, CODE_GUIDE and LANDING_SEO updated. Local work only; no push/deploy. Existing unrelated mobile roadmap edits and API `docs/ADMIN.md` are preserved outside this commit.


## Nearby places and itinerary insertion (2026-10-01)

- Collapsed disclosure below each daily ActivityItem; filters radius 1–5 km, restaurants/cafés, attractions, parks/nature reserves, hotels/accommodation and result count 1–5. Search is on demand, with loading/error/empty states, straight-line distance, Google Maps links and provider attribution. Four UI languages; selected insertion form receives keyboard focus.
- Add asks for a trip day and position: end, before or after an existing activity. Owner/editor can add; viewer can search/read. New activity has saved coordinates, correct activity type, target day date, price 0 and no assumed time/weather. Use normal Edit to schedule it.
- Default provider is live OpenStreetMap/Overpass, ordered by Wikipedia/Wikidata references then distance. This is not review popularity. Optional server-only `GOOGLE_PLACES_API_KEY` enables Places API (New) POPULARITY ranking and actual ratings/review counts; no key configured here, Google path verified with mocks only. No billing provisioning or deployment performed.
- Additive `days.activity_order` JSONB migration `npm run migrate:nearby` applied to configured DB. No existing rows rewritten; trips=5, days=36, activities=118 before/after. Custom order starts only when user adds a nearby place; untouched days retain original ordering. Later normal creates append to custom days. Public/private itinerary responses apply order and hide internal order metadata.
- Verify: browser nearby/weather/trips 12/12 desktop/mobile with API mocks; Front build + unit 14/14 pass, lint 9 existing warnings; API unit 54 pass + 1 opt-in social SQL test skipped. Live Overpass returned three real named restaurants within 1 km of a public Bangkok coordinate. Prisma runtime read succeeded on configured DB; PostgreSQL smoke verified weather JSON/clear + insertion/normal append with temporary fixtures rolled back (sequence IDs can have gaps). Mobile nearby panel screenshot reviewed; no overflow.
- Integration rerun: API `npm run test:itinerary:integration` explicitly creates disposable fixtures inside a rolled-back transaction; does not edit existing itinerary rows. Environment must have both feature migrations installed first. Localhost only; no push/deploy.


## Manual weather at day/activity level (2026-10-01)

- Optional manual observations: 22 icon conditions, 15 description presets, custom description (1,000 characters), decimal Celsius temperature −100..70. Blank is null; 0 and negative readings remain valid. Codes localize in TH/EN/ZH/KO.
- Day/activity records are independent; no automatic inheritance or replacement of AI forecasts. Owner/editor can edit through existing CRUD; viewer/public share can read. Explicit null clears; omitted field preserves existing observations.
- Additive `manual_weather` JSONB on days/activities; `npm run migrate:manual-weather` applied to the DB configured for localhost API. Before/after: trips=5, days=36, activities=118. No reset/deploy/push.
- Verified: API 47 passed + 1 opt-in SQL test skipped; Front unit 14 passed, build passed, lint 9 existing warnings; weather/trip browser coverage 8/8 desktop/mobile with mocks (save, reload, independent observations, clear, public share). Reviewed mobile form screenshot.


## Travel notebook visual redesign (2026-10-01)

- Before-design checkpoint: `c95a9d7` (empty commit marking the existing working application; pre-existing unstaged mobile ROADMAP edits are preserved separately).
- Added `src/visual-design.css`, imported after legacy styles: warm paper/forest palette, opaque surfaces, restrained elevation, 16px cards/12px controls, visible keyboard focus, calmer hover behavior and matching dark theme. Landing, auth, dashboard, trip/map, billing and social pages inherit the system. Existing dog illustration, branding, copy and full-width content remain.
- Production changes outside CSS: one stylesheet import in main.jsx and one decorative Dashboard class. No handler, state, route, API, dependency, schema or DB change. Existing overflow/scroll layout and planner's inline square textarea are retained.
- Standards used: WCAG contrast minimum and target size; test checks four core foreground/background pairs >=4.5:1 in both themes, mobile dashboard width and visible focus. This is not a full WCAG conformance audit.
- Build, SEO and unit 13/13 pass; lint has 9 pre-existing warnings. Browser suite: 37/42 passed after test fixture/copy alignment; remaining 5 failures resolved by current auth/planner copy, original textarea shape and waiting for shared-data request before loader screenshots. Targeted auth/planner/loading rerun 10/10 passed (desktop/mobile), completing coverage of all 42 cases across runs.
- Tests updated for prior copy-audit text, translated language-selector labels, notification/invitation shell requests and the new palette; product text/logic not changed. Reviewed dashboard light/dark and existing regression screenshots. Testing remains localhost with API mocks; no push/deploy.
- To undo just the visual system, remove visual-design.css import and dashboard-welcome class; existing theme IDs/preferences remain compatible. Git checkpoint identifies the pre-design version.

## Chat workspace and dock UX (2026-10-01)

- Full-width chat now prioritizes the conversation on mobile; friends/manage controls follow below. Desktop uses a compact friend sidebar, avatar room header, horizontally scrollable room selection and bounded message area.
- Location/map controls live in a keyboard-accessible disclosure, with active-sharing indicator; map previews/Google links and explicit consent flows remain available. Group creation form is collapsed initially to reduce visual clutter.
- Shared composer supports multiline textarea, Enter send / Shift+Enter newline with IME guard, visible focus styling and send button. Messages follow new content when near the bottom; reading older history does not intentionally jump on polls.
- Dock keeps draggable positioning; refresh moves to header and close has its own translated accessible label. Bounded location tools and independent message scrolling keep the composer inside the panel.
- `pages/Chat.css` scopes the shared page/dock styling. New labels TH/EN/ZH/KO; API/send/location contracts unchanged.
- Verified localhost with API mocks: social + notifications 6/6 desktop/mobile including multiline dock send and composer bounds with maps open, consent, deletion and drag; reviewed light/dark page and dock screenshots. Build/unit 13/13 pass; lint has 9 existing warnings after prior copy audit. No API/DB change or push/deploy.

## Copy audit 4 ภาษา: กระชับ + เป็นธรรมชาติ (2026-09-30)

- ตรวจและ rewrite ข้อความ UI ทั้ง product (TH/EN/ZH/KO): ตัดคำซ้ำ คำฟุ่มเฟือย และศัพท์ช่างที่โผล่ถึง user ("72 ไบต์ UTF-8", "token", "(ล่าสุด 100 รายการ)"); ฟอร์ม login ภาษาไทยที่เคยเป็นอังกฤษครึ่งฟอร์มแปลเป็นไทยหมด; toast "Login Success!!" เป็นประโยคปกติ
- ล็อกศัพท์: ทริป/กิจกรรม/งบ/จุดหมาย, Trip/activity/budget/destination; ชื่อเฉพาะคง EN (Google Maps, QR, AI, THB, Sidebar); ZH ใช้标点เต็มรูป (？，。！…), KO โทน ~해요 ให้สม่ำเสมอ
- เพิ่ม key ใหม่: `trip.tag` (ป้าย Trip #id), `common.language` (aria), `act.coords` (แทน "📍 Map (optional)"), `auth.logoutFail` (toast เดิม hardcode EN ใน userStore), `notif.unread` (aria badge); เพิ่ม `tKey()` ใน i18n ให้ store เรียกภาษาตามเครื่องได้; ตัด ⏰/📍 ออกจาก label
- แก้ FAQ landing ที่ข้อมูลตกยุค (เคยบอกว่า AI สร้างทริปไม่ได้ ทั้งที่มี AiPlanner แล้ว) ทั้ง 4 ภาษา; key parity ครบ 423 keys ไม่ขาดไม่เกิน
- ตรวจ build ผ่าน, lint 0 errors, unit 13/13, SEO ผ่าน; ไม่แตะ logic/DB; commit นี้เท่านั้น ไม่รวม ROADMAP.md ที่อีก session แก้ค้างไว้

## Traveling dog loading screen (2026-09-30)

- Replaced shared spinner with a lightweight SVG dog carrying a backpack, walking legs/wagging tail, mountains, signpost and animated route/dots. Styles scoped in `components/LoadingScreen.css`; theme-aware scenery and text.
- Shared by owner/public trip loading, TripMapPage initial data loading and both router/AppLayout Suspense fallbacks. Uses existing loading conditions with no artificial wait or fake progress.
- Loading title/hint localized TH/EN/ZH/KO; decorative SVG hidden from assistive tech, one polite status announcement; `prefers-reduced-motion` disables all animation.
- Browser test 2/2 desktop/mobile checks waiting state, responsive fit, reduced motion and disappearance when data resolves; reviewed light/dark screenshots. Build/unit 13/13 pass; lint has 8 existing warnings. Front only, no push/deploy.

## Chat send SQL regression — API fix (2026-09-30)

- User reported sending messages fails. Confirmed API notification `jsonb_build_object` parameters caused PostgreSQL 42P18 and rolled back the message transaction after notifications migration.
- API commit `87aedd5` adds explicit text casts; real PostgreSQL read-only EXPLAIN of the production INSERT passes. API unit 45 passed; opt-in SQL suite 6/6 passed. No real chat messages were sent for verification and no DB data/schema changed.
- Front chat handlers unchanged; API localhost watcher has loaded the fix. No push/deploy. See API HANDOVER and docs/CODE_GUIDE for read-only SQL regression command; earlier mock browser tests could not detect SQL type inference failures.

## Trip invitation discovery (2026-09-30)

- สาเหตุ: TripInvitations เคยแสดงเฉพาะ Dashboard และ fetch ครั้งเดียว; notification inbox/badge ยังไม่รวม pending trip invitations
- นำ component เดิมมาใช้ใน Notifications พร้อมรับ/ปฏิเสธ; ดึงรายการจาก `/collaboration/invitations` จึงรองรับคำเชิญที่ส่งไว้แล้ว ไม่ต้องส่งใหม่หรือ migrate DB
- Dashboard/Notifications refresh คำเชิญทุก 10 วินาทีและเมื่อ focus; แสดง error เมื่อโหลดล้มเหลว, ไม่ล้างรายการเดิมเมื่อ poll fail; invalidate request เก่าหลังตอบรับ/ปิด component
- Bell/sidebar count รวม unread social + จำนวนคำเชิญ pending; event หลังตอบคำเชิญ refresh badge ทันที; Mark all read มีผลต่อ social notifications เท่านั้น คำเชิญค้างจนผู้รับ accept/decline หรือ owner ถอน
- Accept ใช้ PUT endpoint เดิมและเปิดทริป; permission logic และข้อมูล DB เดิมคงไว้
- ตรวจ localhost ด้วย mocks: notifications/trips 10/10 desktop/mobile, unit 13/13, build ผ่าน; lint 8 warnings เดิม; ไม่ push/deploy

## Navigate + QR sizing and social UI refresh (2026-09-30)

- พบสาเหตุที่แก้ wrapping แล้วยังล้น: right column เป็น flex แนวตั้งที่จำกัด max-height แต่ children ยอม shrink; `.glass` clip เนื้อหาที่เลยขอบล่าง ตรวจซ้ำก่อนแก้ด้วย browser assertion แล้วล้มที่ Trip map
- เพิ่ม `.trip-side-column > * { flex-shrink: 0 }` ให้ scroll ทั้งการ์ดตามความสูงจริง; QR จัดกลางพร้อมคำอธิบายและปุ่มเต็มแถว แยกจากกันแทนการเบียดข้าง QR
- ปรับหน้าแชท, floating chat และ notification inbox ด้วย social surfaces/hero ตาม theme tokens, bubble ข้อความ, spacing, unread dot/ring และปุ่มรับเพื่อนใต้ข้อความบนมือถือ; คง handlers/API/polling/consent/drag และตำแหน่งกระดิ่งใน Dashboard header เดิม
- Localhost browser tests ใช้ API mocks: social/notifications/trips ผ่าน 10/10 desktop/mobile; ตรวจเนื้อหาด้านข้างและด้านล่างของการ์ดที่ 390/1024/1280px และดู screenshots navigation/chat/notifications; build, unit 13/13 ผ่าน, lint มี 8 warnings เดิม
- แก้ตาม feedback เรื่องพื้นที่ว่าง: Chat/Notifications ใช้ `w-full` ไม่จำกัด max-width และไม่จัดกลาง; browser ตรวจ main ชิดขอบขวาของ viewport โดยเหลือ padding ภายใน; รัน social/notifications ซ้ำผ่าน 4/4 และ build ผ่าน
- งานรอบนี้ Front UI เท่านั้น ไม่แก้ API/DB และไม่ push/deploy; รายการ mobile roadmap ของผู้ใช้ที่ค้างอยู่ยังคงไว้และไม่รวม commit
- สถานะ migration ที่ถูกต้องให้อ้างอิง API HANDOVER ล่าสุด: notifications migration apply แล้วกับ DB ที่ API localhost ใช้; ข้อความเก่าในประวัติด้านล่างที่ระบุว่ายังไม่ได้ apply เป็นสถานะก่อนหน้า

## Header, trip cards, and draggable chat dock

- วาง notification bell ใน Dashboard header แถวเดียวกับ language switcher, ชื่อผู้ใช้ และ logout; เอาออกจาก sidebar brand และ app bar แยก
- ป้องกันข้อความ Trip map/Navigate+QR ล้นด้วย min-width/word wrapping ใน flex children และปุ่ม; browser ตรวจกรอบข้อความเทียบการ์ดจริง
- Chat dock ลากตาม pointer ไปตำแหน่งใดก็ได้ตามขอบจอ, clamp ไม่ให้ออกจาก viewport และบันทึกพิกัด; panel เปิดภายใน viewport
- ตรวจ browser `social.spec.js`, `trips.spec.js`, `billing.spec.js` ผ่าน 10/10 desktop/mobile รวมธีม popup, ยกเลิก/ยืนยัน, prompt เปลี่ยนชื่อ, drag และกรอบการ์ด

## Theme-aware confirmation and input dialogs

- แทนที่ browser-native `confirm`/`prompt` สำหรับลบทริป/วัน/กิจกรรม/ประวัติอากาศ/เพื่อน/แชท, ยกเลิก public share, ยืนยันคำสั่งบิล และเปลี่ยนชื่อสมาชิก ด้วย AppDialog ที่ใช้สีจาก active theme
- Dialog รองรับ confirm/cancel, alert และ prompt, ปิดด้วย Escape/backdrop, focus input, Enter ส่งค่า และแสดงปุ่มอันตรายแยกสี; ข้อความทั่วไปครบ TH/EN/ZH/KO
- ไม่พบ `window.alert` ใน source; error ปัจจุบันใช้ inline status/toast ที่มี theme อยู่แล้ว
- Browser tests กดยกเลิกและยืนยันจริง, เปลี่ยนชื่อผ่าน prompt, ตรวจ revoke และผ่าน desktop/mobile

## Header notifications and chat removal

- เพิ่มปุ่มกระดิ่งบนแถบด้านบนทั้ง desktop/mobile/classic layout พร้อม unread badge; รีเฟรชตอนเข้า route, กลับมา focus และทุก 10 วินาที
- เพิ่มปุ่มลบแชทจากรายการ เรียก membership endpoint ให้แชทหายจากบัญชีปัจจุบัน โดยสมาชิกอื่นยังเห็นประวัติเดิม
- Header navigation และการลบแชทมี browser coverage บน desktop/mobile
- Notification events จะถูกสร้างเมื่อ DB มีตาราง `notifications`; environment ที่ยังไม่ได้รัน API `npm run migrate:notifications` จะแสดง badge เป็น 0

## Chat regression and friend removal

- Root cause: social API wrote notifications in the message/friendship transaction; configured DB has no notifications table yet, so those transactions rolled back.
- API now checks table availability and keeps existing chat/request/accept flows working while notification migration is pending; notification rows are skipped until the additive migration is applied.
- Added confirmed Remove friend action in Friends list using existing DELETE endpoint; relationship is removed while old conversation history remains.
- Verified API 45/45, Front build/lint/unit 13/13, social browser 2/2 (desktop/mobile); only browser run needed localhost bind permission.

## Notification inbox, chat map, and collaborator panel

- เพิ่ม route `/notifications` และ sidebar unread badge; หน้าแจ้งเตือนรับคำขอเป็นเพื่อนได้ตรงนั้น และกดข้อความเพื่อเปิด conversation ที่ถูกต้อง
- API บันทึก `friend_request`/`new_message` เป็น notification event; หน้าแชทมี OSM map preview สำหรับ location shares และปุ่มเปิด Google Maps
- จัดการ์ดผู้ร่วมทริปใหม่เป็น header/count, ฟอร์มเชิญสองแถว และรายการเพื่อนพร้อมสถานะ/role/remove action; ย่อ gap ใน side column
- Browser test ตรวจ bounding box ของ Trip map/QR/collaborator เทียบ side column บน desktop/mobile แล้ว ไม่มีการ์ดยื่นออกนอกคอลัมน์
- Test บน localhost ด้วย API mocks; browser social/notifications/trips รวม 10/10 desktop/mobile; build/lint/unit ผ่าน
- API ต้อง apply `npm run migrate:notifications` บน DB environment ก่อนใช้จริง; migration ยังไม่ได้ apply กับ DB ที่ตั้งค่าไว้ เพราะ connection URL ชี้ไปฐานข้อมูลนอกเครื่อง

## ตรวจซ้ำหลัง UI ไม่เปลี่ยนตามที่คาด

- สาเหตุ: `.glass-card` ใน `src/index.css` กำหนด radius แบบ global มีลำดับเหนือ rounded utilities; `.btn` กำหนด `overflow: hidden` จึงตัด label ที่ wrap
- เพิ่ม `.trip-layout-card` override เฉพาะ trip map/nav/collaborator cards: radius 16px และปุ่มไม่ clip พร้อม radius 10px
- เพิ่ม browser assertions ตรวจ computed styles และลาก/จำตำแหน่ง chat dock; `trips.spec.js` + `social.spec.js` ผ่านรวม 8/8 ทั้ง desktop/mobile, build ผ่าน
- Commit ก่อนหน้าที่มีเฉพาะ component classes ยังไม่ push จึงไม่มีผลบนเว็บที่ deploy; commit แก้ cascade รอบนี้ก็ยังต้อง push/deploy จึงจะเห็นบนเว็บ

## ปรับการ์ดแผนที่/นำทาง/ผู้ร่วมทริป

- จัดความกว้างและ padding ของการ์ดแผนที่, QR นำทาง และผู้ร่วมทริปให้ตรงกันตามคอลัมน์
- ลดมุมโค้งของการ์ดและปุ่ม ปรับปุ่มให้สูงตามข้อความหลายภาษา ลดอาการตัวอักษรถูกเบียด/ตัด; ฟอร์มผู้ร่วมทริปย่อ-ขยายได้ในจอแคบ
- Chat bubble ลากไปยังมุมใดมุมหนึ่งของจอได้และจำตำแหน่งไว้; แผงแชทเปิดเข้าด้านในจอ
- คง logic/API เดิม; build, lint, unit 13/13, browser `trips.spec.js` + `social.spec.js` รวม 8/8 (desktop/mobile) ผ่าน

## Friends, group chat, timed location

- เพิ่มหน้า `/chat` สำหรับเพิ่ม/ตอบรับเพื่อน, เริ่มแชทส่วนตัว, สร้างกลุ่ม, ส่งข้อความ และส่งคำขอแชร์พิกัด
- Floating chat dock เปิดแชทด่วนจากหน้า protected; ข้อความ/ตำแหน่ง refresh ทุก 4 วินาทีขณะเปิดแชท
- แชร์ location ต้องกดเองและอนุญาต browser geolocation; ตั้งเวลา 5 นาที/15 นาที/1 ชม./8 ชม./24 ชม. หรือหยุดก่อนเวลาได้
- ย้าย/ย่อการเชิญผู้ร่วมทริปไปใต้แผนที่ด้านขวา
- ปุ่ม Message dock ย้ายมุมด้วยการลาก และบันทึกมุมที่เลือกไว้ใน localStorage
- API migration `npm run migrate:social` apply แล้วกับ DB ที่ตั้งใน environment นี้; ตรวจ trips=5 และ tables social ยังว่าง ต้อง apply แยก DB environment อื่นก่อน deploy ที่นั่น ดู API `docs/SOCIAL_CHAT_PLAN.md`
- ตรวจ Front build/lint/unit และ browser suite 34/34 (2 workers); API unit 40/40
- commits ในเครื่องยังไม่ได้ push/deploy; social migration apply เฉพาะ DB ที่ตั้งใน environment นี้

- เริ่มฟีเจอร์ร่วมทริป: เจ้าของเชิญบัญชีเดิมเป็น viewer/editor, ผู้รับยอมรับ/ปฏิเสธจาก Dashboard, ผู้ร่วมออกจากทริปได้ และเจ้าของถอนสิทธิ์ได้
- Viewer อ่านแผนและ ledger; editor แก้แผนและ ledger; ปุ่มแก้ไข/ลบทริป/แชร์ public ซ่อนตาม role โดย API เป็นตัวบังคับสิทธิ์จริง
- หน้า Trip มีจัดการผู้ร่วมและคำเชิญครบ TH/EN/ZH/KO; Build ผ่าน, lint ไม่มี error (8 warnings เดิม)
- เชื่อม API repo คู่กัน; migration collaboration ถูก apply กับฐานข้อมูลที่ตั้งใน environment นี้แล้ว และยืนยันว่าทริปเดิม 5 รายการยังอยู่; environment อื่นต้อง apply migration ก่อนใช้ API รุ่นนี้
- `ROADMAP.md` มีการแก้ไขอื่นค้างอยู่ใน working tree และคงไว้โดยไม่ stage ใน commit ฟีเจอร์นี้
- GitHub Actions run [36524216696](https://github.com/Krist-KritnarinP/Persoanl-project-front/actions/runs/36524216696) ผ่านตามสถานะที่ผู้ใช้ยืนยัน
- งานล่าสุดทำ browser tests ให้ใช้ได้บน GitHub Actions โดยไม่เปลี่ยน production logic
- Roadmap หารบิลระบุพัฒนาชุดแรกแล้ว; แผนร่วมทริป/งาน rollout อยู่ใน API `docs/TRIP_COLLABORATION_PLAN.md`

---

# Handover — Frontend CI repair (2026-09-29)

- GitHub Actions run 36521327905 ของ commit 52cc4de: npm ci/unit/build/SEO/Chromium install ผ่าน; browser tests ล้ม 8 (6 screenshot path `/private/tmp` ใช้ได้บน Mac แต่ไม่มีบน Ubuntu, 2 planner test กดปุ่ม dashboard ที่ถูกย้ายไป `/trips/ai` แล้ว)
- เปลี่ยน screenshot test เป็น `test.info().outputPath(...)` ของ Playwright และให้ planner test เปิด route จริงโดยตรง; ไม่แก้ production logic
- รัน browser suite ครบ 32 desktop/mobile ผ่านบนเครื่อง; GitHub Actions ของ commit แก้ยืนยันผ่านแล้วใน run 36524216696
- Log: https://github.com/Krist-KritnarinP/Persoanl-project-front/actions/runs/36521327905

---

# Handover — Billing full-width correction (2026-09-29)

- แก้หน้า `/trips/:tripId/billing` ที่เผลอใส่ `max-w-[1500px] mx-auto` ระหว่างปรับ UI ทำให้จอกว้างเหลือขอบว่าง; ตอนนี้ใช้ความกว้างทั้งหมดของพื้นที่ด้านขวา sidebar
- เหลือ gutter ภายใน 16px มือถือ/24px desktop เพื่อไม่ให้ข้อความติดขอบจอ; ไม่จำกัดความกว้างหน้าอีกแล้ว
- เพิ่ม browser assertion ตรวจว่าขอบขวาของ main ไปถึงขอบ viewport ทั้ง desktop/mobile; ไม่เปลี่ยน logic บิล/API/DB

---

# Handover — Billing UX refresh (2026-09-29)

- หน้า `/trips/:tripId/billing` เปลี่ยนจากฟอร์มยาวน้ำหนักเท่ากันเป็น hero + ปุ่มเพิ่มบิล, การ์ดยอดยืนยัน/ยอดค้าง, ทางลัด, section สมาชิก/บิล/คืนเงินที่แยกชัด
- เพิ่มทางไปขั้นถัดไปหลังเพิ่มสมาชิก; กดเพิ่ม/แก้บิลแล้วเลื่อนไปฟอร์ม; หากไม่มียอดค้างซ่อนฟอร์มคืนเงิน และซ่อนประวัติที่ยังว่าง
- เน้นยอดค้าง/ยอดรับคืนในบัตรสมาชิก, ใช้สีที่อ่านได้ทั้งสองธีม; ฟอร์มบิลมีหัวข้อขั้นตอนและกรอบรายละเอียดที่สแกนง่ายขึ้น; ข้อความ TH/EN/ZH/KO
- ตรวจ unit 13, build, lint ไม่มี error (warnings 8 เดิม), browser billing desktop/mobile 2 ผ่าน รวม VAT/service/tip/คืนบางส่วน/ย้อนรายการ/4 ภาษา/สี dropdown
- เปลี่ยนเฉพาะ Front UX ไม่มีการแก้สูตรเงิน/API/DB; ไม่ได้แก้ข้อมูลทริปจริง

---

# Handover — Trip billing entry (2026-09-29)

- หน้าเจ้าของทริปเปลี่ยนปุ่ม outline เล็กเป็นการ์ดสีอุ่นใต้ข้อมูลทริป ทั้งการ์ดกดเข้า `/trips/:tripId/billing` ได้
- การ์ดบอกชัดว่าหารค่าใช้จ่าย เพิ่มบิลและติดตามยอดค้าง พร้อม CTA ที่เด่นบน desktop และลูกศรบนมือถือ; ข้อความครบ TH/EN/ZH/KO
- ตรวจหน้าทริปด้วย browser test, build และ i18n keys; ไม่เปลี่ยน logic บิลหรือ API

---

# Handover — Full-width pages + trip billing (2026-09-29)

- เก็บ UI ตาม feedback: select/option ทุกหน้าและเมนูประเภทกิจกรรมใช้พื้นหลังทึบ พร้อมสีข้อความ light/dark; เอาสี option ที่ขัดกับ dark mode ออกจาก LanguageSwitcher
- หน้าบิลเพิ่มทางลัดสมาชิก/บิล/คืนเงิน, หัวข้อขั้นตอนในฟอร์ม, ช่องกรอกอ่านง่ายและ focus สำหรับ keyboard
- ตรวจล่าสุด: unit 13 ผ่าน, browser billing desktop/mobile 2 ผ่าน รวม contrast ของ select/option ทั้งสองธีม, 4 ภาษา และไม่ล้นแนวนอน; build ผ่าน
- วิธีลอง: เปิดทริป → ค่าใช้จ่าย / หารบิล → เพิ่มสมาชิก → เพิ่มบิล → ตรวจยอดรายคนก่อนยืนยัน → บันทึกคืนเงินบางส่วนได้
- Sidebar ใช้รูป MiniDog และ font-display/gradient เหมือน Header; AiPlanner/TravelOverview เอา max-width ออก
- เปิดทริป → ค่าใช้จ่าย / หารบิล → /trips/:tripId/billing; owner-managed THB ไม่มี AI
- สมาชิกไม่ต้องสมัคร, รายการย่อย, หลายผู้จ่าย, หาร4แบบ, VAT/service/tip, previewรายคน, คืนบางคน/บิล/บางส่วน และ reversal
- ใช้สูตร backend; previewหมดอายุเมื่อแก้ฟอร์ม, ล็อกฟอร์มระหว่าง request, retryใช้requestIdเดิม, แยกงบกิจกรรม/ยอดบิล/เงินคืน
- APIเพิ่มตารางและgenerate clientแล้ว ไม่ต้องmigrationซ้ำบนDBเดิม; หากAPIเก่าไม่reloadให้ restart npm run dev
- Unit13/build ผ่าน; browser billing+sidebar คอม/มือถือผ่าน รวม4ภาษา; lintไม่มีerror warnings8 (7เดิม+asyncload effect)
- คู่มือเทคนิคหลัก: PersonalProject_API/docs/BILLING.md; แผนเดิมใน docs/SPLIT_BILLS_PLAN.md อัปเดตสถานะแล้ว
- ใช้ HTTPfixtures ใน browser และ DB smoke แยกตรวจเงิน/สิทธิ์/concurrencyด้วยข้อมูลชั่วคราวที่ลบแล้ว
- ไม่เรียกAI ไม่โอนเงินจริง ไม่ seedบิลจริง; commitทั้งสองrepo ไม่push

---

# Handover — Small sidebar edge arrow (2026-09-28)

- ตาม feedback ผู้ใช้: เอาปุ่มเปิด Sidebar ใหญ่มุมขวาล่างออก เปลี่ยนเป็นแถบลูกศรเล็กชิดขอบซ้ายบน (left0/top6)
- ปุ่มปิดโหมดใน sidebar/drawer ใช้ลูกศรเล็กด้วย มี aria-label/title และ keyboard focus
- ไม่เปลี่ยนหน้าเดิม/logic/การจำโหมด; ไม่มี backend หรือ DB changes
- ตรวจ browser desktop/mobile การสลับโหมดและ logout; commit Front ไม่ push

---

# Handover — Sidebar / classic layout switch (2026-09-28)

- แก้ตามผู้ใช้: ปิด Sidebar ต้องซ่อนทั้งแถบและคืน header/ดีไซน์ก่อน sidebar ไม่ใช่ย่อเป็นไอคอน
- Desktop ปุ่ม “ปิด Sidebar · ใช้หน้าตาเดิม”; mobile มีปุ่มนี้ใน drawer; classic มีปุ่มเปิด Sidebar มุมขวาล่าง
- navigationMode ใน localStorage จำ classic/sidebar; legacy sidebarCollapsed=true แปลงเป็น classic เมื่อยังไม่มีค่าใหม่
- Outlet context ส่ง sidebarEnabled ให้หน้าเดิม ใช้ handlers/store ร่วม ไม่ทำสำเนา logic หน้า
- Classic Dashboard คืน navbar/profile/logout/search, stats, AI และ TravelOverviewCard; หน้าทริป/map/AI/profile/overview คืน header เดิมตามโหมด
- Sidebar mode คงเมนู/profile/logout ด้านล่าง; public/auth/share ไม่เปลี่ยน
- Build ผ่าน, unit13 ผ่าน, browserสลับโหมด desktop/mobile2 ผ่าน รวม persist/menu/profile/logout; lint ไม่มี error warnings7 เดิม
- ไม่แก้ API/DB/env; commit Front เท่านั้น ไม่ push

---

# Handover — Responsive shared sidebar (2026-09-28)

- เพิ่ม layouts/AppLayout.jsx ครอบ protected routes: ภาพรวม / ทริปของฉัน / สร้างทริปด้วย AI
- ด้านล่างมีภาษาและธีม, user/profile และ Logout ใช้ store เดิม ไม่เปลี่ยน auth logic
- Desktop ย่อเป็นไอคอนและจำค่า localStorage; mobile native dialog drawer มี backdrop/Escape/focus trap/คืน focus และปิดเมื่อเปลี่ยนหน้า/ขยายจอ
- Dashboard เหลือ trip list/search/CRUD; สถิติอยู่ TravelOverview, เอา AI/overview teaser และ navbar ซ้ำออก; URL เดิมคงอยู่
- Public landing/login/reset/share ไม่มี sidebar; ไม่ทำ trip tabs หรือ split bills รอบนี้
- Front unit 13 + build ผ่าน; browser 16 cases ผ่านหลังแก้ selectors/คืน focus และ rerun เฉพาะที่ล้มเหลว (sidebar, trips/share/map, overview, 4ภาษา)
- Lint ไม่มี error: 6 warnings เดิม + 1 เรื่องปิด modal ใน effect เมื่อ route เปลี่ยน (ตั้งใจรองรับ history navigation)
- ไม่แก้ API/schema/DB/dependencies; ไม่มี AI call; commit Front เท่านั้น ไม่ push

---

# Handover — แผนหารบิลทริป (2026-09-28)

- ผู้ใช้สั่งทำแผนรอ ยังไม่เริ่มฟีเจอร์ และไม่ใช้ AI
- แผนครอบคลุมสมาชิก/ผู้จ่ายหลายคน/หารเท่ากัน-กำหนดยอด-%-ส่วน/รายการย่อย/VAT รวมและบวกเพิ่ม/service charge/tips
- คืนบางคน บางบิล บางส่วนระหว่างทริปได้ มี allocation และประวัติ reversal ไม่ลบหนี้ของคนอื่น ไม่เพิ่มยอดเที่ยวจากเงินคืน
- แยกงบ Activity.price จากบิลยืนยัน ไม่ดึงงบเดิมมาสร้างหนี้หรือรวมยอดซ้ำ
- MVP เจ้าของจัดการ THB ก่อน; สิทธิ์ร่วม/หลายสกุล/โอนจริง/AI เป็นงานนอกขอบเขต
- รายละเอียดและ acceptance: [docs/SPLIT_BILLS_PLAN.md](docs/SPLIT_BILLS_PLAN.md) เป็นแผนที่ต้องอ่านก่อนเริ่มงาน
- รอบนี้ docs-only ไม่มีแก้โค้ด/schema/env/DB ไม่มี test runtime ที่ต้องรัน; commit แยกสอง repo ไม่ push

---

# Handover — Travel overview dashboard (2026-09-28)

- เพิ่มกล่องแผนที่ใต้ AI Trip Assistant เปิด /travel-overview: ปฏิทินช่วงทริป ตัวกรองวัน/สถานะ ค่าใช้จ่ายรายทริป/รวม และหมุดตามวันที่กิจกรรม
- สถานะตามแผน ไม่ใช่ check-in; ยอดรวม Activity.price เป็น THB อาจรวมประมาณการ ไม่ใช่ยอดชำระยืนยัน
- GET /api/trips/overview ใช้ auth + owner query + whitelist + pagination; ไม่มี geocode/AI เพิ่ม ไม่แก้ schema/env/ข้อมูลจริง
- รองรับ 4 ภาษาและมือถือ โหลดแผนที่แบบ lazy พร้อม loading/retry/empty
- Front unit 13, API unit 35, browser desktop/mobile 4 ผ่าน; build ผ่าน, lint 7 warnings เดิม ไม่มี error
- คู่มือไฟล์/พฤติกรรม/ข้อจำกัดพิกัด: [docs/TRAVEL_OVERVIEW.md](docs/TRAVEL_OVERVIEW.md)
- Commit แยก Front/API ไม่ push/deploy; ต้องรัน API เวอร์ชันใหม่เพื่อให้ endpoint overview ใช้งานได้

---

# Handover — Weather development logs (2026-09-28)

- Front dev Console แสดง [Weather → API] พร้อม tripId/language
- API terminal แสดง [Weather → AI] พร้อม prompt จริง จำนวน characters (ไม่ใช่ tokens) และ output budget ก่อนเรียก provider
- Cache hit แสดงว่าใช้ประวัติ ไม่มี AI request; ไม่ log key/header/credentials
- Backend เปิด log เมื่อ NODE_ENV=development หรือ npm run dev เท่านั้น และปิดเสมอเมื่อ NODE_ENV=production; prompt มีสถานที่/วันเดินทาง อย่าแชร์ log สาธารณะ
- ตรวจ syntax/diff; ไม่เรียก AI เพิ่ม ไม่เปลี่ยน logic request/cache; commit ทั้งสอง repo ไม่ push

---

# Handover — AI Weather รายช่วงเวลา + Modal (2026-09-28)

- เพิ่มแนวโน้มอากาศตามพื้นที่กิจกรรม เช้า/กลางวัน/เย็น พร้อมผลต่อแผนและการเตรียมตัว รองรับ 4 ภาษา
- กล่องขนาดคงที่ scroll ภายใน; เปิดคำตอบเต็ม/ประวัติเก่าใน Modal ที่รองรับมือถือและ Escape
- Prompt ใช้สถานที่ไม่ซ้ำและตารางย่อ; Front ส่ง tripId/language เท่านั้น API อ่านข้อมูลที่ตรวจเจ้าของแล้ว
- ระบุชัดว่า seasonal estimate ไม่ใช่พยากรณ์สด; cache v3, ป้องกัน input ใหญ่/คำตอบถูกตัด และเก็บ history เต็มแทนตัด 8k
- ตรวจ API 33, Front unit 11, browser weather 2 ผ่าน; build ผ่าน lint ไม่มี error (7 warnings อื่น)
- รายละเอียด ขีดจำกัด และสิ่งที่ยังไม่ได้ทดสอบ: [docs/WEATHER_AI.md](docs/WEATHER_AI.md)
- ไม่เรียก Gemini จริง ไม่แก้ schema/env/demo data; commit แยก Front/API ไม่ push/deploy

---

# Handover — ภาษา UI ทุกหน้าและภาษา AI (2026-09-28)

- แก้หน้า AI ให้รองรับ th/en/zh/ko ครบ พร้อม LanguageSwitcher; แก้จุดตกหล่น Dashboard/auth/profile/trip/map/share, tooltip, day labels และ validation
- Planner/weather รับ language allowlist/default th; cache แยกภาษา; แผนเดิม/ข้อมูลผู้ใช้ไม่ถูกแปลทับเมื่อสลับ UI
- เช็กทุกหน้าทั้ง desktop/mobile 4 ภาษาและข้อความไทยตกค้าง; browser รวม 18 cases ผ่านหลัง rerun timeout ด้วย 2 workers; Front unit 11, API รวม 31; build/SEO ผ่าน, lint warnings เดิม 9
- รายละเอียดและข้อจำกัด: [docs/I18N_AUDIT.md](docs/I18N_AUDIT.md)
- ไม่แก้ schema/dependency/env/ข้อมูล demo และไม่เรียก AI จริงเพิ่ม; commit แยก Front/API ไม่ push/deploy

---
## บันทึกรอบก่อน

# Handover — ร่างครบในคลิกเดียว + แผน BYOK (2026-09-27)

- AiPlanner ใช้ generateCompletePlan loop ต่อช่วงอัตโนมัติจนจบ; UI สั้นลงเหลือประโยคเดียวพร้อม progress; ลองทำต่อมีเฉพาะเมื่อขัดข้อง
- API คืน retryAfterSeconds เฉพาะ minute quota; frontend รอแบบ abortable แล้ว retry ไม่เกิน 3 ครั้งติดกัน. Daily/provider quota ไม่ยิงซ้ำอัตโนมัติ
- ออกจากหน้าแล้ว abort งานรอ/request และไม่ส่งช่วงใหม่; ยังต้องเปิดหน้าไว้ ไม่มี worker/background job รอบนี้
- เก็บข้อจำกัด provider/ค่าใช้จ่าย key กลางไว้; ไม่เพิ่มเพดานวัน ไม่อ้างว่า AI ใช้ได้ไม่จำกัดจริง
- เอกสารแผน 1 user/own project key: docs/AI_BYOK_PLAN.md พร้อม secret storage, ownership, per-user quota, no silent shared fallback, worker phase; ยังไม่รับ/จัดเก็บ key ผู้ใช้จริง
- ทดสอบ unit orchestration สำเร็จ/รอ quota/daily quota/cancel และ browser desktop/mobile; build ผ่าน. ไม่เรียก AI จริงเพิ่ม ไม่แก้ schema/env/ข้อมูล demo
- ผลตรวจ: Front unit 9, API เดิม 28 + retry quota 1, browser 4 ผ่าน; lint 9 warnings เดิม ไม่มี error
- commit แยก Front/API ไม่ push/deploy

---
## บันทึกรอบก่อน

# Handover — QR “Data too long” crash (2026-09-27)

- สาเหตุ: TripNavCard ส่ง URL ซึ่งรวมชื่อสถานที่ percent-encoded เข้า QRCodeSVG โดยไม่ตรวจขนาด; ชื่อไทยหลายจุดทำให้เกิน encoder capacity แม้จำกัดจำนวนจุดแล้ว
- เพิ่ม src/components/NavigationQr.jsx ใช้ทั้ง TripNavCard (owner/share) และ TripMapPage: ตรวจ UTF-8 byte length <=2,000 ก่อนสร้าง QR level L; เกินแล้วแสดงข้อความแทน QR และคงลิงก์เดิม ไม่ตัดชื่อหรือจุดหมาย
- มี error boundary เฉพาะ encoder เป็นชั้นสำรอง; reset ตาม URL ทำให้เลือกเส้นทางสั้นแล้ว QR กลับมาได้
- ข้อความ fallback แปลครบ 4 ภาษา; ไม่เปลี่ยนข้อมูลทริป/AI/ฐานข้อมูล
- Browser tests 6 ผ่านบน desktop/mobile รวมชื่อไทยยาวใน owner/share, เปลี่ยนวันแล้ว QR กลับมา, regression map/share/edit/theme; build ผ่าน, lint 9 warnings เดิมไม่มี error
- ผู้ใช้รีเฟรชหน้าเดิมได้ ไม่ต้องสร้างทริปใหม่; QR ของเส้นทางยาวยังต้องเลือกจุดให้น้อยลง ลิงก์ Google Maps ยาวอาจมีข้อจำกัดปลายทาง
- commit เฉพาะ Frontend; backend ไม่เปลี่ยน ไม่ push/deploy

---
## บันทึกรอบก่อน

# Handover — ทริปยาว + token notice + ช่องข้อความ (2026-09-27)

- ตามผู้ใช้สั่ง: ยกเลิกเพดาน 7 วันต่อทริป; แบ่งร่างทีละ 7 วันและกดร่างต่อ พร้อมจำนวนวันที่เสร็จ/ทั้งหมด
- แจ้ง token ก่อนเริ่มและแสดง usage ที่มีข้อมูล; โควตาเดิมยังคงอยู่ ติดโควตาแล้วทำต่อได้จาก PLAN v2 เดิมข้ามวัน
- partial draft ยังแก้/confirm ไม่ได้; เมื่อครบจึงเปิดให้แก้และบันทึกเหมือนเดิม; merge ภายใต้ account lock
- parser planner ย้ายมาก่อน global JSON parser ตรวจ auth ก่อนรับ payload 10 MB; API อื่นไม่เปลี่ยน
- textarea ความต้องการเอา rounded ออก เพิ่ม padding/line height แก้ตัวอักษรถูกบัง
- API 28 unit ผ่าน; browser ทริป 9 วัน/resume/notice/textarea บน desktop/mobile; build ผ่าน. รอบนี้ไม่ได้เรียก Gemini จริงหรือแก้ DB demo
- คู่มือ/ข้อจำกัด: docs/AI_PLANNER.md; ไม่เพิ่ม dependency/schema/env; commit แยกสอง repo ไม่ push

---
## บันทึกรอบก่อน

# Handover — AI Trip Planner MVP (2026-09-27)

- ทำครบ flow ข้อความ + ปฏิทิน 1–7 วัน → Gemini draft → Zod validate → preview แก้/ลบกิจกรรม → ยืนยัน atomic save → เปิดหน้าทริปเดิม
- เข้าได้จากปุ่ม “สร้างทริปด้วย AI” ด้านบน Dashboard หรือ sidebar → `/trips/ai`; UI ใหม่ภาษาไทย
- ใช้ PLAN record เป็นร่างและ durable confirmation receipt; account lock + transaction กัน duplicate/partial saves; auth/owner/100-trip limit; weather history ไม่ปน PLAN
- ค่าใช้จ่ายประมาณการ THB รวมทั้งกลุ่ม ไม่ใช่ราคายืนยัน; AI ไม่เขียนพิกัด ใช้ geocode เดิมหลังบันทึก
- Gemini schema แบบเต็มเคยตอบ 400: แก้เป็น structural schema ฝั่ง provider และตรวจ bounds/วัน/เวลา/ราคา/unknown fields ด้วย Zod ฝั่ง server ตามเดิม
- ทดสอบเรียก Gemini จริงโจทย์ 1 วันผ่าน พร้อม cache/no-trip-before-confirm; ยังไม่รับรองคุณภาพสถานที่หรือราคาและทริปยาวทุกกรณี
- API unit 27 ผ่าน; Front unit 7 ผ่าน; browser desktop/mobile 2 ผ่าน; PostgreSQL ชั่วคราวผ่าน ownership/date/rollback/5 confirmations→1 trip/weather isolation; build/SEO ผ่าน; lint 9 warnings เดิม
- ไม่แก้ schema, dependencies, secrets หรือข้อมูล demo จริง ไม่ deploy/push รอบนี้; commit แยกสอง repo
- งานค้าง/คู่มือ/checklist: [docs/AI_PLANNER.md](docs/AI_PLANNER.md); ROADMAP อัปเดตแยก MVP จาก price references/confidence/translation/draft recovery ที่ยังไม่ทำ
- การแก้ preview หายเมื่อ refresh; AI draft cache 6 ชม. ไม่ใช่ retention cleanup; ใช้ quota ร่วมกับ weather

---
## บันทึกรอบก่อน

# Handover — รับช่วง refactor จาก agent เดิม (2026-09-27)

- รับช่วงงานค้างโดยเก็บทุกส่วนของ agent เดิมไว้ รวมบันทึก geocode priority
- จัดรูปแบบ source และแยกเฉพาะ presentation/helper ที่เหมือนกันจริง; คง route, UI, CSS, auth, เวลา, ธีม, map/AI logic เดิม
- เอกสารให้อีก agent: [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)
- คู่มือสำหรับผู้เริ่มต้น: [docs/CODE_GUIDE.md](docs/CODE_GUIDE.md)
- ผลตรวจ: Front unit 6+1, API unit 20+2, browser ทริป/share/map 4 กรณีผ่าน; build/SEO ผ่าน, lint 9 warnings เดิมไม่มี error
- Source ที่จัดรูปแบบอย่างเดียวผ่าน normalized AST comparison; ส่วนย้าย helper/components ตรวจตาม flow ที่เกี่ยวข้อง
- ไม่แก้ DB/schema/secrets/dependencies ไม่ push/deploy; ไม่ขยายงานตรวจซ้ำเกินความจำเป็นตามคำสั่งผู้ใช้
- รอบนี้ commit ใน repo นี้; ดู git log ล่าสุดเพื่ออ้างอิง revision

---
## บันทึกรอบก่อน

# Handover — ปรับความชัดเจนของตัวหนังสือ Landing (2026-09-26)

- เปลี่ยนข้อความหลักเป็น charcoal #272b2a และข้อความรอง #505650; หัวข้อเน้นเป็นน้ำตาลอุ่น #89502f
- ลดพื้นเขียวในส่วนตัวอย่าง/การ์ดเป็นครีมเทา และแยกสีปุ่มเขียวออกจากสีข้อความ
- ขยายเนื้อหาเป็นประมาณ 16–18px, หัวข้อการ์ด 21px (มือถือ 18px), ขยายข้อความเล็กและ navigation
- การ์ดฟีเจอร์บนมือถือเรียงคอลัมน์เดียว ให้ข้อความใหญ่ขึ้นโดยไม่บีบพื้นที่อ่าน; navbar รองรับ wrap
- ตรวจภาพ desktop/mobile, browser Landing 4 กรณีผ่าน รวมสลับ 4 ภาษาและตรวจ overflow; build และ SEO checks ผ่าน
- เปลี่ยนเฉพาะ Landing CSS/เอกสาร ไม่เพิ่ม dependency; commit local ไม่ push/deploy

---
## บันทึกรอบก่อน

# Handover — Landing page + SEO (2026-09-26)

- ตามคำสั่งล่าสุดทำ Landing ก่อน; Export PDF พักไว้ ยังไม่มี implementation/dependency ของ PDF
- ทำใน PersonalProject_Front เดิม: หน้าแรก `/` เป็น Landing; Login ย้าย `/login` พร้อมแก้ auth guard, recovery links และ 401 redirect
- ดีไซน์ cream/forest green พร้อม SVG postcard, ฟีเจอร์ 5 ส่วน, demo ทริปสลับวันได้, FAQ, CTA และ 4 ภาษา
- Landing ไม่ยิง API/AI/geocoding; ผู้มี session กด CTA ไป dashboard ส่วน guest ไป login
- Build prerender เนื้อหา Landing ภาษาไทยลง HTML, meta/OG, optional real-domain canonical/robots/sitemap, noindex auth/private routes
- ไม่มี VITE_SITE_URL จะ noindex ไว้ก่อน; checklist การเปิด SEO จริงและข้อจำกัดอยู่ [docs/LANDING_SEO.md](docs/LANDING_SEO.md)
- ตรวจภาพ desktop/mobile; build ผ่าน, unit 6 ผ่าน, browser 8 ผ่านรวม auth regression; static SEO checks ผ่านทั้งมี/ไม่มีโดเมน; lint 0 errors/8 warnings เดิม
- อัปเดต ROADMAP และ API auth setup ให้ชี้ `/login`; ไม่แก้ backend logic/DB/secrets และไม่ deploy/push
- เริ่มดู: npm run dev → http://localhost:5173/ ; login เดิม http://localhost:5173/login

---
## บันทึกรอบก่อน

# Handover — Phase 0 + Google/Forgot Password ใน Front เดิม (2026-09-26)

ทำงานใน `PersonalProject_Front` ที่ใช้ npm run dev จริง คู่กับ `PersonalProject_API` ไม่ใช้ monorepo backup

- หน้า Login `/` มี Google DaisyUI fallback และ Forgot Password เสมอ; ตั้ง Client ID แล้วใช้ GIS button จริง
- เพิ่ม `/forgot-password`, `/reset-password` เข้าถึงได้แม้มี login ค้าง; reset token รับจาก fragment แล้วล้าง URL
- Google ชนบัญชีเดิมเปิด dialog ยืนยันรหัสผ่าน ก่อนเชื่อม; token Google เก็บใน memory ไม่บันทึก localStorage
- Refresh interceptor/cookie, single-flight/Web Locks, account export/delete ใน profile และข้อความ 4 ภาษา
- คงโค้ด map/TripMapPage/TripsActivity เดิม ไม่คัดลอก snapshot เก่าทับ
- Unit 6 ผ่าน, build ผ่าน, lint 0 errors/8 warnings เดิม, Playwright desktop/mobile 4 ผ่าน พร้อมตรวจ screenshot เห็นปุ่มครบ
- Browser tests mock API/Google; ยังไม่รับรอง OAuth/mail จริงจนตั้งค่าตาม checklist
- API สำรองและเพิ่ม schema ใน DB เดิมแล้ว; ข้อมูล mockup เดิมอยู่ครบตาม row-count checks
- Checklist ที่ต้องทำ: [AUTH_SETUP](../PersonalProject_API/docs/AUTH_SETUP.md)
- Phase 0 งานภายนอกที่ค้าง: [OPERATIONS](../PersonalProject_API/docs/PHASE0_OPERATIONS.md) และ ROADMAP
- Restart `npm run dev` ใน Front และ API หลังตั้ง env; เข้า `http://localhost:5173/` และ logout หาก login อยู่
- Commit โค้ด/tests/docs ใน repo นี้; ไม่ push ไม่ deploy

---
## บันทึกรอบก่อน (ประวัติ ไม่ใช่สถานะล่าสุด)

# HANDOVER — AI LHOUNG Travel Planner

## สถานะใช้งานล่าสุด: ย้อน setup deploy กลับมาใช้ 2 repos เดิม

- ผู้ใช้ขอพักและย้อน setup deploy: ใช้ `PersonalProject_Front` คู่กับ `PersonalProject_API` เท่านั้น
- Frontend application code คงที่ commit `5f2e488`; การกลับชุดเดิมไม่ต้อง reset เพราะงาน monorepo/deploy/auth ใหม่ไม่ได้แก้ source ใน repo นี้
- ย้าย `AIlhongdeploy` และ worktree `AIlhongdeploy-phase0` ไป `/Users/kritnarinp/Desktop/Codecamp_23/_AI_LHOUNG_BACKUP_2026-09-26/` พร้อม Git history และ repair worktree links แล้ว
- Google Login/Forgot Password และ Phase 0 ของ monorepo พักไว้ใน backup ไม่ใช่ฟีเจอร์ใน repo ที่ใช้งานนี้
- รัน `npm run dev` ภายใน repo นี้สำหรับ frontend และภายใน `PersonalProject_API` สำหรับ API ดูคำสั่ง/checklist ใน `../START_HERE.md`
- ไม่เปลี่ยน `.env`, ฐานข้อมูล, ข้อมูลทริป หรือ remote services; GitHub/Render/Vercel เดิมยังไม่ได้ลบ/ปิด ไม่ push รอบนี้เพื่อหลีกเลี่ยง deployment
- ตรวจสถานะ Git, scripts, source ของสอง repos และ git diff --check; เปลี่ยนเฉพาะเอกสาร ไม่รัน tests ที่เชื่อม DB

เอกสารส่งมอบงานสำหรับ dev คนต่อไป / คน deploy / คนสอบ
อัปเดตล่าสุด: 2026-09-26 (รอบ 12: ปุ่ม dashboard ใน overlay แผนที่เต็มจอ)

> **สถานะล่าสุด:** แก้ security หลักและ performance แล้ว ดูหัวข้อ 5.8 และ [SECURITY_REVIEW.md](SECURITY_REVIEW.md) ก่อน deploy ยังต้องตรวจ hosting/HTTPS/backup/monitoring จริง ส่วนหัวข้อเก่าเป็นประวัติงาน ไม่ใช่ config ปัจจุบัน

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

## 5.7 ผลตรวจ Security (2026-09-25)

ตรวจโค้ดจริงทั้ง frontend/backend แล้ว พบว่ามี ownership check, bcrypt, JWT จำกัด algorithm, Helmet, CORS และ rate limit บางเส้นทาง รวมถึง token แชร์สุ่มและยกเลิกได้ อย่างไรก็ตาม ยังต้องแก้ก่อนเปิด public ดังนี้:

- [ ] ยืนยันรหัสเดิมก่อนเปลี่ยนรหัสผ่าน และเพิกถอน session/token เก่าหลังเปลี่ยนรหัสผ่าน
- [ ] เพิ่มความแข็งแรงของรหัสผ่าน (ปัจจุบันขั้นต่ำ 4 ตัว) และใช้ JWT secret production แบบสุ่มอย่างน้อย 32 bytes
- [ ] ซ่อน error ภายในจาก response และกรองข้อมูลอ่อนไหวใน log
- [ ] เพิ่ม validation ครบทุก Trip/Day/Activity รวม ID, วันที่, ราคา, ความยาวข้อความ และพิกัด
- [ ] ตรวจสิทธิ์ทริปก่อนเรียก AI เพิ่มโควต้ารายบัญชี/เพดานทั้งระบบ และจำกัดการสร้าง/อ่านข้อมูล
- [ ] แยก role ฐานข้อมูลสำหรับ runtime ออกจาก role สำหรับ migration (config เครื่องที่ตรวจใช้บัญชี postgres)
- [ ] ประเมิน JWT ใน localStorage และตั้ง frontend security headers/CSP
- [ ] แก้ API `.gitignore` ให้กัน `.env.local`/`.env.production` ด้วย โดยยกเว้น `.env.example`

**หลักฐาน:** frontend build ผ่าน; ทดสอบด้วย mock ยืนยันว่าเปลี่ยนรหัสผ่านได้โดยไม่ถามรหัสเดิม, JWT เก่ายังตรวจลายเซ็นผ่าน, schema รับรหัสผ่าน 4 ตัว และ error handler ส่งรายละเอียด error กลับจริง การทดสอบนี้ไม่แตะฐานข้อมูลจริงและยังไม่ได้เพิ่ม regression test ลง repo

**ขอบเขต:** ยังไม่ได้ทำ penetration test, dependency vulnerability audit หรือยืนยัน HTTPS/backup/สิทธิ์ DB บน hosting จริง ต้องทดสอบสิทธิ์ข้ามบัญชีและเกณฑ์ใน [SECURITY_REVIEW.md](SECURITY_REVIEW.md) ก่อนเปิดใช้งานสาธารณะ

## 5.8 รอบ 10 — Performance และ Security (2026-09-26)

### สาเหตุแผนที่ช้าและการแก้ไข

- เดิม `mapPool` รอ Photon ทุกจุดก่อน emit; เปลี่ยนเป็นส่งผลจาก worker ทันที และรวม state update ทุก 80 ms
- หน้าเต็มเดิมซ่อนแผนที่เมื่อ `geoLoading`; ตอนนี้แสดง DB/cache/หมุดที่พบก่อนทันที ไม่รอจุดช้า
- มี request timeout 6 วินาทีและงบเวลาต่อรอบ 15 วินาที, abort ตอนออกหน้า, แชร์ request ชื่อเดียวกัน และจำกัด worker 2 ตัว
- cache ใน memory/localStorage สูงสุด 500 รายการ; ผลสำเร็จ 30 วันและไม่พบ 5 นาที; ไม่อ่าน/เขียน localStorage ต่อหมุด
- ใช้ `useTripCoordinates` ร่วมสามหน้า ข้อมูล popup ใช้ activity ปัจจุบัน ไม่ค้างจากการแก้ชื่อ/คำอธิบาย
- ยกเลิก Nominatim fallback อัตโนมัติ: บริการ public จำกัดรวมทั้งแอป 1 req/s ไม่ใช่ต่อ browser และเดิม fallback ทำให้คิวยาว
- ใช้ Photon-compatible URL ผ่าน `VITE_GEOCODE_URL`; public demo ไม่มี SLA ควรเปลี่ยน provider เมื่อมีผู้ใช้มาก
- ยกเลิก automatic fire-and-forget PUT พิกัดทุกจุด เพื่อไม่เขียนทับการแก้ไขระหว่างค้นหา/ยิง write ซ้ำ พิกัดที่ค้นหาอัตโนมัติอยู่ใน cache; การค้นหา/กรอกแล้วบันทึกผ่าน ActivityModal ยังเก็บลง DB
- แผนที่ไม่ animate fit ทุกหมุด และหยุด auto-fit หลังผู้ใช้ลาก/zoom; ลด tile buffer และ cache marker icons
- ถ้าค้นหาไม่ครบภายในกำหนด แสดงจุดที่มีและข้อความให้แก้พิกัดในกิจกรรม ไม่ค้าง spinner

### หน้าเว็บ

- แยก route เป็น lazy chunks; entry JS จาก 764.72 KB เหลือประมาณ 227.84 KB ก่อน gzip (ไม่ใช่ขนาดรวมทุก chunk)
- หน้า login/dashboard ไม่โหลด Leaflet; ลด blur ซ้อนในการ์ด/ปุ่ม/input ทุกขนาดจอ และตัด shine/floating animation
- แก้ชื่อ import `Userprofile` ให้ตรงตัวพิมพ์สำหรับ Linux และใช้ `import.meta.dirname` ใน Vite config
- รายการทริปแบ่งหน้า 100 รายการและดึงเฉพาะวันที่/ลำดับวัน; frontend โหลดต่อเมื่อมี nextPage

### Security ที่แก้แล้ว

- JWT อายุ 1 ชั่วโมงพร้อม `tokenVersion`; เปลี่ยนรหัสผ่านต้องยืนยันรหัสเดิม และเพิ่ม version แบบมีเงื่อนไขป้องกัน race
- `POST /api/users/logout` เพิกถอน token ทุกเครื่องของบัญชี; frontend ล้าง state หลัง server ยืนยัน
- รหัสผ่านใหม่ขั้นต่ำ 15 ตัวและไม่เกิน 72 UTF-8 bytes; bcrypt cost 12; บัญชีเดิมยัง login ได้
- validation Trip/Day/Activity/ID, วันที่ ราคา และพิกัด; body schema ไม่รับ field แปลกปลอม
- error 5xx เป็นข้อความกลางและ log เฉพาะ request ID/status/code ไม่ log request หรือ Prisma error ทั้งก้อน
- AI ตรวจเจ้าของก่อนเรียก และใช้ข้อมูลทริปจาก DB; cache คำตอบ 6 ชั่วโมงเมื่อ itinerary ตรงกัน; timeout 25s, output สูงสุด 1500 tokens, ไม่มี automatic retry
- quota AI เก็บใน `ai_usage` และ transaction/advisory lock: 10 ครั้ง/บัญชี/วัน, 100 ครั้งทั้งระบบ/วัน (ตั้ง env ได้), 2 ครั้ง/บัญชี/นาที; นับ attempts แม้ provider ล้มเหลว ลบประวัติไม่คืนโควต้า
- จำกัดสร้าง 100 trips/บัญชี, 60 days/trip, 100 activities/day ใน transaction; rate limit API รวมและ share; ตัด auth ซ้ำที่ DaysRoute
- `TRUST_PROXY_HOPS` default 0 ต้องตั้งตาม reverse proxy จริง; production ปฏิเสธ secret สั้น/placeholder และ FRONTEND_URL ที่ไม่ใช่ HTTPS
- migration เพิ่ม `users.token_version`, ตาราง `ai_usage` พร้อม RLS และ index วันที่ AI; **apply กับ DB ที่เครื่องนี้ใช้อยู่แล้ว**
- สร้าง role `ailhoung_runtime` ที่ไม่มี DDL/จัดการ role และเปลี่ยน local DATABASE_URL แล้ว; policy อนุญาตเฉพาะ trusted backend role ส่วนการแยกผู้ใช้ยังอยู่ที่ API ไม่ได้เปิดให้ Supabase anon/authenticated
- สุ่ม local JWT secret ใหม่แล้ว **ผู้ใช้เดิมต้อง login ใหม่**; เก็บ owner DIRECT_URL สำหรับ migration แยก ห้ามใช้ใน runtime production
- `.gitignore` กัน `.env*` ยกเว้น example; frontend มี Vercel headers และ `_headers`/`_redirects` สำหรับ host ที่รองรับ ต้องตรวจว่า host จริงนำไปใช้
- อัปเดต Prisma/client/adapter เป็น 7.10.0 ตรงกัน; overrides `deepmerge-ts` 8.0.0 และ `mysql2` 3.24.4 เพื่อปิด advisory ใน Prisma tooling; validate/generate ผ่าน

### วิธีอัปเดต environment อื่น

1. Backup DB แล้วใช้ owner `DIRECT_URL` รัน `npm run migrate:security` (additive/idempotent สำหรับ schema ที่มีอยู่ ไม่ใช่สร้าง DB ใหม่)
2. `npm ci` และ `npx prisma generate`; schema มี generated client commit ตามเดิม
3. ตั้ง runtime role แยกจาก owner; `npm run security:runtime-role` ใช้ครั้งเดียวเพื่อสร้าง role และเขียน local .env หยุดหาก role มีอยู่แล้ว อย่ารันซ้ำเพื่อ rotate โดยไม่ตรวจ
4. ตั้ง `DATABASE_URL`, `JWT_SECRET` ใหม่ที่สุ่มอย่างน้อย 32 bytes, `FRONTEND_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`, `TRUST_PROXY_HOPS` ตาม host และ AI limits
5. Runtime ใช้ `npm start`; frontend ตั้ง `VITE_API_URL=https://<api-domain>/api` แล้ว build ใหม่

### การตรวจยืนยัน

- Backend `npm test`: 7 tests ผ่าน; frontend `npm test`: 4 tests ผ่าน
- API integration สองบัญชีจริงผ่าน: CRUD, validation, ownership, share/revoke, password change และ logout revocation; สร้างข้อมูลชั่วคราวแล้วลบเฉพาะที่สร้าง ไม่มีการเรียก Gemini
- `prisma validate`, `prisma generate` และ frontend production build ผ่าน
- หลังปรับ dependencies: npm install audit ฝั่ง API รายงาน 0 vulnerabilities; frontend production dependency audit 0
- Browser/performance smoke และสถานะ repo ดูบันทึกส่งมอบล่าสุดที่ท้ายไฟล์

### ข้อจำกัดที่ยังต้องดูแล

- JWT ยังอยู่ localStorage; CSP ลดความเสี่ยงแต่ไม่ทำให้ token ปลอดภัยหากเกิด XSS ยังไม่ได้ย้ายเป็น HttpOnly cookie
- rate limit ต่อ IP ใช้ memory ต่อ process; quota AI ใช้ DB ร่วมแล้ว หากเพิ่มหลาย instance ควรใช้ shared store สำหรับ auth/global IP limit
- ไม่มี password breach/blocklist, email verification หรือ recovery flow ใหม่ในรอบนี้
- ไม่มีการ deploy hosting หรือทดสอบ restore/monitoring จริง และไม่ได้ยืนยันความแม่นยำ/ความเร็ว public geocoder บนเครือข่ายผู้ใช้

## 6. TODO ที่เหลือ (ยังไม่ทำ)
- [x] มี automated regression tests และ integration smoke แล้ว (ดูหัวข้อ 5.8)
- [x] แยก route chunks แล้ว entry JS ประมาณ 227.84 KB ก่อน gzip
- [ ] ฟีเจอร์ `AI สร้างทริป` ยังเป็นปุ่ม disabled (รอ backend)

## 7. Deploy Checklist
- [ ] ตรวจข้อจำกัดที่เหลือในหัวข้อ 5.8 และผ่านเกณฑ์ก่อนเปิด public ใน [SECURITY_REVIEW.md](SECURITY_REVIEW.md)
- [ ] ตรวจ HTTPS, proxy/rate limit, CORS, frontend headers, secret และ dependency บนสภาพแวดล้อมที่จะ deploy
- [ ] ทดสอบสิทธิ์ด้วยสองบัญชี, token revocation, public share และ backup restore บน staging
- [ ] ตั้ง env หลังบ้าน: `DATABASE_URL, DIRECT_URL, JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, FRONTEND_URL, PORT`
- [ ] DB เดิม: `npm run migrate:security` ด้วย owner DIRECT_URL; อย่าใช้ db push ด้วย runtime role
- [ ] ตั้ง `VITE_API_URL` หน้าบ้านเป็น domain API จริง แล้ว `npm run build`
- [ ] ห้าม commit `.env` / `.env*.bak` (ignore แล้ว) — `src/generated/prisma` ตั้งใจ commit ไว้
- [ ] อย่าเอา Supabase anon/service key มาใช้ฝั่ง front (ไม่จำเป็น)

## 8. Demo Script (3 นาที)
1. Login → Dashboard (search + สถานะทริป)
2. สร้างทริป → เข้า `/trips/:id` → เพิ่ม Day + Activity
3. กด `ทำนาย` อากาศ AI → ประวัติถูกเก็บ (`GET /history/:tripId`)
4. แก้โปรไฟล์ `/userprofile` → Logout


## Final verification — 2026-09-26

- Frontend tests: 4 passed; backend tests: 7 passed.
- Real database integration: two-account isolation, CRUD, validation, share/revoke, password and logout session revocation passed using the limited runtime role. Temporary test records removed. No paid AI requests made.
- Production build passed. Entry JS is 227.87 kB (70.76 kB gzip), compared with the earlier 764.72 kB entry. Other route/shared chunks load separately; this is not the total page download size.
- Chromium desktop/mobile smoke: progressive pins, lazy map bundle, password confirmation field, no horizontal overflow or page errors. Synthetic geocoder test showed first two pins in approximately 0.5 seconds while a third lookup was delayed 8 seconds; this is not a real provider latency benchmark. Map tiles were mocked/blocked, so live tile delivery was not measured.
- Fixed CSS prefix ordering after browser testing revealed production CSS still enabled blur. Added map resize observation and reset viewport when switching day.
- Dependency audits at time of work: backend full audit and frontend production audit reported zero known vulnerabilities. This is not a penetration-test guarantee.
- Combined publication folder: `../AIlhongdeploy`, with `frontend/` and `backend/`. Original repositories and their histories remain intact. The new repo is a snapshot, not merged Git histories.
- Deployment has NOT been performed. Follow the combined root README for environment variables, database initialization and hosting settings. Existing local users must log in again following the JWT secret rotation.

## Commit — 2026-09-26 (รอบ 10+11)

- งานค้างรอบ security hardening + แผนที่ (tokenVersion, AiUsage, runtime role scripts, lazy routes, geocode, SECURITY_REVIEW.md) ถูก commit ครบทั้ง 2 repos แล้ว ยังไม่ push

## 5.5 งานรอบ 11 (2026-09-26)

**กลับ dashboard จากแผนที่:** โลโก้ AI LHOUNG ใน header ของ `/trips/:id/map` และ `/trips/:id` กดแล้วไป `/dashboard` (เดิมกดไม่ได้ กลับได้แค่หน้าทริป)

**AI log ข้อมูลที่ส่งออก:** backend log `[AI weather] outgoing: {model, tripId, location, start, end, days, activities, promptChars}` ที่ terminal ทุกครั้งที่ยิง Gemini (ไม่มี API key) + หน้าบ้าน log request payload ที่ browser console

**Prompt สรุปทั้งทริป:** เลิกสั่ง "ไม่เกิน 20 คำ" → สั่ง AI ตอบ 2 ส่วนคั่นด้วย `---DETAILS---`: (1) ไฮไลต์ภาพรวม ≤6 บรรทัด (2) รายวัน `Day N (วันที่)` + แต่ละที่สรุปเช้า/กลางวัน/เย็น ที่ย่อยเอาแค่ไฮไลต์ — ส่งรายวันแบบ `Day N (date): ที่1, ที่2` ให้โมเดลแทน JSON ดิบ

**การ์ดอากาศแบบกล่อง scroll + modal:** กล่องสรุปล็อก `max-h-44` + scroll (ไม่ยืดตามตัวอักษร) ปุ่มดูรายละเอียดทั้งหมดเปิด modal พื้นทึบ — ใช้กับทั้งผลล่าสุดและประวัติ (ถ้า AI ไม่คืน marker จะโชว์ข้อความเต็มเหมือนเดิม)

**⚠️ หมายเหตุเทส:** predict จริงติด rate-limit รวมต่อ IP (30 ครั้ง/10 นาที, แชร์กันทั้ง localhost) และโควต้า Gemini free tier — กดปุ่มรัวๆ จะโดน 429 เอง ไม่ใช่บั๊ก

## 5.6 งานรอบ 12 (2026-09-26)

**ทางกลับ dashboard จาก overlay แผนที่เต็มจอ:** overlay (`TripMap` modal `z-[1000]`) เดิมมีแค่ปุ่ม X ปิด — เพิ่มปุ่ม dashboard (ไอคอนบ้าน + `nav.dashboard` 4 ภาษา) ไป `/dashboard` ได้จากทุกที่ที่เปิด overlay

## 5.7 งานรอบ 13 (2026-09-26)

**ปุ่ม dashboard ชัดๆ ในหน้าแผนที่เต็ม:** โลโก้กดได้อาจสังเกตยาก → เพิ่มปุ่ม dashboard (ไอคอนบ้าน + ข้อความ) ข้างปุ่มย้อนกลับใน `/trips/:id/map` โดยตรง
**หมายเหตุ:** ถ้ากดแล้วเด้งไปหน้า login แสดงว่า token หมดอายุ/ถูกเพิกถอนหลัง rotate JWT secret — ให้ login ใหม่ ไม่ใช่บั๊กปุ่ม; ถ้าเทสตัว deploy เก่าให้ rebuild/refresh ก่อน

## 5.8 งานรอบ 14 (2026-09-26)

**ปุ่มย้อนกลับหน้าแผนที่เต็มไป dashboard:** ตามรีเควส — ปุ่มย้อนกลับบน `/trips/:id/map` ไป `/dashboard` โดยตรง (ปุ่ม "กลับหน้าทริป" ด้านล่างคงเดิมสำหรับย้อนกลับทริป)

## 5.9 งานรอบ 15 (2026-09-26)

**Back chain ตายตัวทีละสเตป:** `/trips/:id/map` → `/trips/:id` → `/dashboard` (ไม่พึ่ง browser history — เปิดลิงก์ตรงมาก็ย้อนถูก): ปุ่มย้อนกลับหน้าแผนที่ไปหน้าทริป, ปุ่มย้อนกลับหน้าทริปไป dashboard (เลิกใช้ `navigate(-1)` ที่เข้าผิดที่ถ้าเปิดลิงก์ตรง)

## 5.10 งานรอบ 16 (2026-09-26)

**ทางออกจาก overlay แผนที่ (หน้า share):** overlay เดิมมีแค่ X เล็กๆ + ปุ่ม dashboard ที่ส่งคนไม่ได้ login ไปติดหน้า login — เพิ่มปุ่มย้อนกลับชัดๆ (ปิด overlay กลับภาพรวมทริปทันที) + ปุ่ม Esc + โชว์ปุ่ม dashboard เฉพาะคน login แล้ว (ไม่ได้แตะโค้ด AI weather ตามที่ขอไว้)

## 5.11 งานรอบ 17 (2026-09-26)

**overlay กดปุ่มไม่ออกแต่ Esc ออกได้:** สาเหตุคือ overlay อยู่ใต้ `.glass` ที่มี transform/backdrop-filter ทำให้ `position: fixed` ถูกขัง relative กับกรอบการ์ด + event ปุ่มโดนรบกวน — แก้โดยย้าย overlay ไป `document.body` ด้วย React Portal (fixed เต็มจอจริง ไม่โดน ancestor บัง) + เหลือปุ่มเดียว (ย้อนกลับ) ตามที่ขอ

## 5.12 งานรอบ 18 (2026-09-26)

**Prompt ประหยัด token (~78%):** ตัด JSON ดิบ 32 รายการทิ้ง ใช้รายวันกระชับ `D2 10-18: TG954(00:05), Muli(นอน)` (วันที่ MM-DD, เวลา HH:MM, ที่นอนต่อท้าย) — ทริปไอซ์แลนด์เหลือ ~1,185 ตัวอักษรจาก 5,439
**ไฮไลต์ตามทริป:** ปิดท้ายสรุปด้วย ★ + ปัจจัยอากาศที่กระทบแผนทริปนั้นมากสุด ให้ AI เลือกเอง (แสงเหนือ/พายุ/ฝน แล้วแต่ทริป ไม่ hardcode)
**แก้บั๊กเวลา:** `activityTime` จาก Prisma เป็น Date object ไม่ใช่ string — เวลาเลยหายหมด แก้ fmtT แล้ว (เทส: 00:05/13:50/16:30/18:00 ถูก)
**เทส:** syntax + dry-run prompt ผ่าน; ยิงจริงติด rate-limit รวม (เทสทั้งวัน) — รอ window รีเซ็ตแล้วกดทำนายจากหน้าบ้านได้เลย

## 5.13 งานรอบ 19 (2026-09-26)

**Prompt ตามสเปก user + ดึงเวลาลงจอด:** ฟอร์แมต `D2 10-18: TG954(00:05-07:25)` (เวลาลงจอดดึงจากคำอธิบายด้วย regex) — ปิดท้ายสรุปด้วย `⚠️ วันที่เสี่ยงสุด` แทน ★ (พายุ/ถนนปิด แล้วแต่ทริป) + ตัวอย่างคำตอบ 1 ชุดบังคับฟอร์แมต — dry-run ทริป 2 ผ่าน (ข้อมูล ~984 ตัวอักษร)

## 5.14 งานรอบ 20 (2026-09-27) — ยืนยัน priority geocode ตามคำสั่ง user

**คำสั่ง user:** priority แรกคือพิมพ์สถานที่/กิจกรรมแล้วเจอสถานที่เลย ถ้าไม่ตรงค่อยเป็น second priority ให้ user แก้เอง ห้ามเปลี่ยนโค้ดมั่ว

**ผลตรวจ:** คอนเซปตรงกับโค้ดปัจจุบันแล้ว จึงไม่แตะโค้ด geocode:
- Priority 1 (auto): `src/utils/geocode.js:92 resolveActivityCoords` + `src/hooks/useTripCoordinates.js:26` — อ่าน DB (`latitude/longitude`) ก่อนเสมอ แล้วค่อย cache แล้วค่อยยิง Photon อัตโนมัติแบบขนาน 2 worker + progressive render
- Priority 2 (manual): `src/components/ActivityModal.jsx:28 handleFindCoords` — ปุ่มค้นหาพิกัดครั้งเดียว + ช่องกรอก lat/lng มือ แล้ว `PUT /activities/:id` เก็บลง DB
- ถ้า auto หาไม่เจอ แผนที่โชว์เฉพาะจุดที่มี + ข้อความให้แก้พิกัดในกิจกรรม ไม่ค้าง spinner

**การตัดสินใจ:** คง `geocode.js` ทั้ง 123 บรรทัดไว้ตามเดิม ไม่ตัด `resolveActivityCoords` ตามข้อเสนอรอบก่อน เพราะขัดกับสเปก user รอบนี้
