// แก้ข้อมูลธุรกิจและช่องทางติดต่อที่นี่ก่อนเผยแพร่จริง
export const business = {
  name: 'TRS TAMRONGSAK', thaiName: 'ทีอาร์เอส ธำรงศักดิ์ คอนสตรัคชั่น',
  phone: '062-248-4089', // เช่น 0812345678
  lineId: '@138wlldt', lineUrl: 'https://line.me/ti/p/%40138wlldt', // เช่น https://line.me/ti/p/~your-id
  email: 'tamrong2519@gmail.com', address: '', serviceArea: 'กรุงเทพฯ และปริมณฑล • ชลบุรี • ระยอง • ฉะเชิงเทรา',
  siteUrl: '', // URL เว็บไซต์จริง เช่น https://www.example.com
  hours: 'กรุณาติดต่อเพื่อสอบถามเวลาทำการ',
};
export const services = [
  { id: 'asphalt', number: '01', title: 'ลาดยางมะตอย', subtitle: 'ปูยางแอสฟัลท์', scene: 0, image: '/images/work-scenes.webp', description: 'รับปูยางแอสฟัลท์สำหรับถนนและลานจอดรถ', details: ['สำรวจสภาพพื้นที่และระดับผิวทาง', 'วางแผนเตรียมพื้นและการระบายน้ำ', 'ปูยางแอสฟัลท์และบดอัดผิวทาง'] },
  { id: 'gravel', slideImage: '/images/gravel-slide.webp', homeImage: '/images/gravel-job.webp', number: '02', title: 'ลานจอดรถหินคลุก', subtitle: 'เกลี่ยและบดอัดหินคลุก', scene: 1, image: '/images/work-scenes.webp', description: 'เกลี่ยและบดอัดหินคลุก สำหรับลานจอดรถและทางเข้าออก', details: ['ประเมินระดับและสภาพพื้นเดิม', 'เลือกวัสดุให้เหมาะกับการใช้งาน', 'เกลี่ยปรับระดับและบดอัดพื้นที่'] },
  { id: 'stone', homeImage: '/images/stone-job.webp', number: '03', title: 'งานหินเกล็ด', subtitle: 'ปรับพื้นที่และทางเข้าออก', scene: 2, image: '/images/work-scenes.webp', description: 'ปรับพื้นด้วยหินเกล็ด สำหรับลานและพื้นที่ใช้งาน', details: ['สำรวจสภาพพื้นเดิม', 'วางแผนวัสดุและระดับพื้นที่', 'เกลี่ยและบดอัดให้เหมาะกับงาน'] },
  { id: 'speed-bump', homeImage: '/images/speed-bump-job.webp', number: '04', title: 'ลูกระนาดยางมะตอย', subtitle: 'ชะลอความเร็วในพื้นที่', scene: 3, image: '/images/work-scenes.webp', description: 'ทำลูกระนาดยางมะตอย เพื่อชะลอความเร็วในพื้นที่', details: ['สำรวจตำแหน่งติดตั้ง', 'กำหนดรูปแบบตามการใช้งาน', 'จัดทำผิวและเครื่องหมายที่เหมาะสม'] },
  { id: 'marking', homeImage: '/images/marking-job.webp', number: '05', title: 'ตีเส้นจราจร', subtitle: 'สีเทอร์โมพลาสติก', scene: 4, image: '/images/work-scenes.webp', description: 'ตีเส้นถนนและช่องจอดรถด้วยสีเทอร์โมพลาสติก', details: ['วางผังช่องจอดและเส้นจราจร', 'เตรียมผิวก่อนทำเครื่องหมาย', 'ตีเส้นด้วยสีเทอร์โมพลาสติก'] },
];
// เพิ่มผลงานจริงได้หลายภาพต่อรายการ โดยใช้รูปใน public/images/
// { title, category: 'asphalt', location, description, images: [{src, alt}] }
export const projects = [];
