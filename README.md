# TRS TAMRONGSAK CONSTRUCTION — เว็บไซต์ธุรกิจรับเหมางานผิวทาง

เว็บไซต์ภาษาไทย 4 หน้า ใช้ Vite และ JavaScript ไม่ต้องมีฐานข้อมูลหรือ backend รองรับมือถือ แท็บเล็ต และเดสก์ท็อป

## เปิดเว็บไซต์เพื่อพัฒนา / Preview

ใช้ Node.js 20.19+ หรือ 22.12+ (สภาพแวดล้อมนี้ใช้ Node.js 24)

```bash
cd /workspace/trs-asphalt-website
npm ci --cache /tmp/trs-npm-cache
npm run dev -- --port 5173
```

เซิร์ฟเวอร์รับการเชื่อมต่อบน `0.0.0.0:5173` หากเครื่องมือที่ใช้มี Preview หรือ Ports ให้เปิดพอร์ต 5173 ถ้ารันบนคอมพิวเตอร์ของคุณ เปิด `http://localhost:5173` ได้

ตรวจ production:

```bash
npm run build
npm run preview -- --port 4173
```

ไฟล์สำหรับนำไปเผยแพร่เป็น static hosting อยู่ใน `dist/` ต้องเผยแพร่ทั้งโฟลเดอร์ รองรับ URL `/index.html`, `/services.html`, `/projects.html`, `/contact.html` โดยไม่ต้องตั้ง SPA fallback

## แก้ข้อมูลก่อนเผยแพร่จริง

- `src/data.js`: ชื่อธุรกิจ เบอร์โทร LINE อีเมล ที่อยู่ พื้นที่ให้บริการ เวลาทำการ และ URL เว็บไซต์จริง
- ข้อมูลติดต่อได้รับการยืนยัน: โทร 062-248-4089, LINE @138wlldt, อีเมล tamrong2519@gmail.com
- `src/main.js`: ข้อความส่วนหน้าแรกและเนื้อหาหน้าต่าง ๆ
- `src/style.css`: สี ขนาดตัวอักษร และการจัดหน้า
- `public/images/`: ใส่ภาพหน้างานจริง แนะนำ WebP/AVIF ที่บีบอัดแล้ว ความกว้างประมาณ 1200px
- ชื่อ SEO และ description ใน HTML ทั้ง 4 ไฟล์ควรปรับให้ตรงชื่อธุรกิจและพื้นที่ให้บริการจริงด้วย

### เพิ่มผลงานหลายรูป

เพิ่มข้อมูลใน `projects` ของ `src/data.js` เช่น:

```js
export const projects = [{
  title: 'ชื่อโครงการจริง',
  category: 'asphalt', // asphalt / gravel / speed-bump / marking
  location: 'พื้นที่โครงการ',
  description: 'รายละเอียดงานจริง',
  images: [
    { src: '/images/project-01.webp', alt: 'รายละเอียดภาพหน้างานรูปแรก' },
    { src: '/images/project-02.webp', alt: 'รายละเอียดภาพหน้างานรูปที่สอง' },
  ],
}];
```

ผลงานกรองตามประเภทและเปิดภาพใหญ่ได้ ภาพ hero.webp และ work-scenes.webp สร้างขึ้นใหม่เป็นภาพประกอบ ไม่ใช่ภาพผลงานจริง รูป Reference ไม่ได้ถูกนำมาใช้เป็นภาพบนเว็บไซต์ โลโก้ SVG วาดขึ้นใหม่ตามแนวทางแบรนด์

## การขอประเมินราคา

ฟอร์มตรวจข้อมูลจำเป็นแล้วสร้างข้อความในเครื่องของผู้ใช้ ให้คัดลอกข้อความ เปิด LINE หรือส่งผ่านแอปอีเมล (เมื่อกำหนดช่องทางแล้ว) ไม่มีการส่งอัตโนมัติ ไม่มีการบันทึกข้อมูลบนเซิร์ฟเวอร์ หากต้องการรับข้อมูลผ่านเว็บไซต์โดยตรง ต้องเชื่อมต่อ backend หรือผู้ให้บริการฟอร์มเพิ่มเติม

## SEO และความเร็ว

Build จะสร้างเนื้อหา HTML ทั้ง 4 หน้าให้อ่านได้โดยไม่ใช้ JavaScript มี title, description, Open Graph, semantic headings และฟอนต์ไทยที่เสิร์ฟจากเว็บไซต์เอง เมื่อกำหนด `siteUrl` จะสร้าง canonical, structured data, sitemap.xml และ robots.txt ที่อ้างอิงโดเมนจริง หลังแก้ข้อมูลให้ build ใหม่เสมอ ไม่รับประกันอันดับ Google

## ทดสอบ

```bash
npm run build
npm test
```

ทดสอบด้วย Playwright และ Chromium ที่ `/usr/bin/chromium` ถ้าเครื่องอื่นมี Chromium คนละตำแหน่งให้ตั้ง `CHROMIUM_PATH` หรือปรับ launchOptions ใน `playwright.config.js` มีการทดสอบ 16 รายการ ครอบคลุม 4 หน้าที่ขนาด 320, 375, 390, 430, 768, 1440px ตรวจเมนู ขอบเขตหน้าจอ ข้อผิดพลาด JavaScript ฟอร์ม ตัวกรอง และเนื้อหา SEO ใน production HTML

## เผยแพร่บน GitHub Pages

```bash
npm run deploy
```

คำสั่งนี้ build สำหรับ `/trs-asphalt-website/` และส่งไฟล์ไป branch `gh-pages` โดยไม่ force push โค้ดต้นฉบับอยู่ที่ branch `main`

เปิด GitHub repository Settings → Pages → Source: Deploy from a branch → Branch: gh-pages → Folder: / (root) → Save

URL หลัง GitHub Pages เปิดใช้งานและ deploy สำเร็จ: https://tamrong2519-collab.github.io/trs-asphalt-website/

เมื่อเปลี่ยนข้อมูลเว็บไซต์ ให้ commit/push source แล้วรัน `npm run deploy` อีกครั้ง การ Preview build แบบ subpath ให้รัน `SITE_BASE=/trs-asphalt-website/ npm run preview`

## ดีไซน์ตาม Reference

ใช้โทนขาว น้ำเงินเข้ม และฟ้าสด Header พร้อมเบอร์โทร Hero ภาพเต็มความกว้าง การ์ดบริการ 5 ประเภท (แยกหินคลุกกับหินเกล็ด) แกลเลอรี 3+2 บนเดสก์ท็อป หน้าติดต่อแบบภาพคู่ข้อมูล ปุ่มลอยโทร/LINE และ Footer ลายเฉียงฟ้า รองรับหน้าจอ 320px ขึ้นไป ภาพตัวอย่างถูกบีบอัดเป็น WebP และใช้ซ้ำเพื่อประหยัดการโหลด

### การอ่านและแตะบนมือถือ

ข้อความทั่วไปบนมือถือ 16px ขึ้นไป Hero 34–44px พร้อมคำอธิบาย 19–20px การ์ดเรียงคอลัมน์เดียว ปุ่มหลักสูง 56px หน้าติดต่อใช้ปุ่มโทรสีน้ำเงินเข้มและ LINE สีเขียววางซ้อนกัน ขอบมน 16px ตัวอักษร 17–18px ปุ่มลอยถูกซ่อนเฉพาะหน้าติดต่อบนมือถือเพื่อไม่ให้ซ้ำกัน การทดสอบตรวจขนาดตัวอักษร ปุ่มไม่ตัดข้อความ ระยะขอบ และหน้าจอไม่ล้น
