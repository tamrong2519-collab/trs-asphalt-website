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
  { id: 'asphalt', number: '01', title: 'ลาดยางมะตอย', subtitle: 'ปูยางแอสฟัลท์', scene: 0, image: '/images/hero-daylight.webp', description: 'ปูยางแอสฟัลท์สำหรับถนนและลานจอดรถ', details: ['สำรวจสภาพพื้นที่และระดับผิวทาง', 'วางแผนเตรียมพื้นและการระบายน้ำ', 'ปูยางแอสฟัลท์และบดอัดผิวทาง'] },
  { id: 'gravel', slideImage: '/images/gravel-slide.webp', homeImage: '/images/gravel-job.webp', number: '02', title: 'ลานจอดรถหินคลุก', subtitle: 'เกลี่ยและบดอัดหินคลุก', scene: 1, image: '/images/work-scenes.webp', description: 'เกลี่ยและบดอัดหินคลุก สำหรับลานจอดรถและทางเข้าออก', details: ['ประเมินระดับและสภาพพื้นเดิม', 'เลือกวัสดุให้เหมาะกับการใช้งาน', 'เกลี่ยปรับระดับและบดอัดพื้นที่'] },
  { id: 'stone', homeImage: '/images/stone-job.webp', number: '03', title: 'งานหินเกล็ด', subtitle: 'ปรับพื้นที่และทางเข้าออก', scene: 2, image: '/images/work-scenes.webp', description: 'ปรับพื้นด้วยหินเกล็ด สำหรับลานและพื้นที่ใช้งาน', details: ['สำรวจสภาพพื้นเดิม', 'วางแผนวัสดุและระดับพื้นที่', 'เกลี่ยและบดอัดให้เหมาะกับงาน'] },
  { id: 'speed-bump', homeImage: '/images/speed-bump-job.webp', number: '04', title: 'ลูกระนาดยางมะตอย', subtitle: 'ชะลอความเร็วในพื้นที่', scene: 3, image: '/images/work-scenes.webp', description: 'ทำลูกระนาดยางมะตอย เพื่อชะลอความเร็วในพื้นที่', details: ['สำรวจตำแหน่งติดตั้ง', 'กำหนดรูปแบบตามการใช้งาน', 'จัดทำผิวและเครื่องหมายที่เหมาะสม'] },
  { id: 'marking', homeImage: '/images/marking-job.webp', number: '05', title: 'ตีเส้นจราจร', subtitle: 'สีเทอร์โมพลาสติก', scene: 4, image: '/images/work-scenes.webp', description: 'ตีเส้นถนนและช่องจอดรถด้วยสีเทอร์โมพลาสติก', details: ['วางผังช่องจอดและเส้นจราจร', 'เตรียมผิวก่อนทำเครื่องหมาย', 'ตีเส้นด้วยสีเทอร์โมพลาสติก'] },
];
// 1 รายการ = 1 ชุดภาพ เพิ่มโครงการใหม่โดยคัดลอกรายการและเปลี่ยนข้อมูลจริง
// รูปแรกเป็นหน้าปก; location เว้นว่างได้; imageKind: 'illustration' ใช้กับภาพประกอบเท่านั้น
export const projects = [
  {
    id: 'asphalt-road', category: 'asphalt', title: 'งานลาดยางมะตอย',
    location: '', description: 'งานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร',
    images: [
      { src: '/images/asphalt-job-01.webp', alt: 'ภาพหน้างานลาดยางมะตอยบริเวณถนนและทางเข้าอาคาร' },
      { src: '/images/asphalt-job-02.webp', alt: 'ภาพหน้างานลาดยางมะตอยและรถบดบริเวณอาคาร' },
      { src: '/images/asphalt-job-03.webp', alt: 'รถบดเก็บผิวลาดยางมะตอยข้างอาคาร' },
      { src: '/images/asphalt-job-04.webp', alt: 'งานบดอัดยางมะตอยบริเวณทางเข้าอาคาร' },
      { src: '/images/asphalt-job-05.webp', alt: 'งานลาดยางมะตอยบริเวณทางโค้งและลานอาคาร' },
      { src: '/images/asphalt-job-06.webp', alt: 'ผิวถนนลาดยางมะตอยและพื้นที่ทางเข้าอาคาร' },
      { src: '/images/asphalt-job-07.webp', alt: 'รายละเอียดผิวลาดยางมะตอยและขอบทาง' },
      { src: '/images/asphalt-job-08.webp', alt: 'ภาพรวมถนนลาดยางมะตอยบริเวณอาคาร' },
      { src: '/images/asphalt-job-09.webp', alt: 'ทีมงานและเครื่องจักรขณะปูยางมะตอย' },
    ],
  },
  {
    id: 'gravel-yard', category: 'gravel', title: 'งานลานจอดรถหินคลุก',
    location: '', description: 'เกลี่ยและบดอัดพื้นลานสำหรับการใช้งาน',
    images: [
      { src: '/images/gravel-job.webp', alt: 'ภาพหน้างานลานจอดรถหินคลุก' },
      { src: '/images/gravel-slide.webp', alt: 'เครื่องจักรเกลี่ยและปรับพื้นลานหินคลุก' },
      { src: '/images/gravel-job-03.webp', alt: 'รถบดบดอัดพื้นลานจอดรถหินคลุก' },
      { src: '/images/gravel-job-04.webp', alt: 'ภาพรวมพื้นลานจอดรถหินคลุกหลังบดอัด' },
      { src: '/images/gravel-job-05.webp', alt: 'ผิวหินคลุกและพื้นที่ลานจอดรถ' },
      { src: '/images/gravel-job-06.webp', alt: 'กองหินคลุกเตรียมเกลี่ยและบดอัดพื้นลาน' },
      { src: '/images/gravel-job-07.webp', alt: 'เตรียมวัสดุหินคลุกสำหรับลานจอดรถ' },
      { src: '/images/gravel-job-08.webp', alt: 'กองหินคลุกและพื้นที่ลานก่อนเกลี่ยปรับระดับ' },
      { src: '/images/gravel-job-09.webp', alt: 'ภาพแนวตั้งของวัสดุหินคลุกเตรียมปรับพื้นลาน' },
      { src: '/images/gravel-job-10.webp', alt: 'รถขุดเตรียมเกลี่ยหินคลุกในลานจอดรถ' },
      { src: '/images/gravel-job-11.webp', alt: 'เครื่องจักรเตรียมพื้นลานก่อนลงหินคลุก' },
    ],
  },
  {
    id: 'stone-yard', category: 'stone', title: 'งานหินเกล็ด',
    anchorAliases: ['stone-building-yard', 'stone-home-yard'],
    location: '', description: 'งานหินเกล็ดสำหรับลาน รอบอาคาร และรอบบ้าน',
    images: [
      { src: '/images/stone-job.webp', alt: 'ภาพหน้างานหินเกล็ด' },
      { src: '/images/stone-job-02.webp', alt: 'ภาพรวมลานหินเกล็ดบริเวณอาคาร' },
      { src: '/images/stone-job-03.webp', alt: 'ลานหินเกล็ดและพื้นที่ทางเข้าอาคาร' },
      { src: '/images/stone-job-04.webp', alt: 'ผิวลานหินเกล็ดและพื้นที่ใช้งาน' },
      { src: '/images/stone-job-05.webp', alt: 'งานหินเกล็ดรอบอาคารและแนวต้นไม้' },
      { src: '/images/stone-job-06.webp', alt: 'รถบดบดอัดพื้นลานหินเกล็ด' },
      { src: '/images/stone-building-01.webp', alt: 'ภาพหน้างานลานหินเกล็ดข้างอาคาร' },
      { src: '/images/stone-building-02.webp', alt: 'ลานหินเกล็ดรอบต้นไม้และแนวกำแพง' },
      { src: '/images/stone-building-03.webp', alt: 'พื้นหินเกล็ดบริเวณทางเดินข้างอาคาร' },
      { src: '/images/stone-building-04.webp', alt: 'ภาพรวมลานหินเกล็ดรอบอาคารและแนวต้นไม้' },
      { src: '/images/stone-home-01.webp', alt: 'ภาพหน้างานหินเกล็ดบริเวณหน้าบ้าน' },
      { src: '/images/stone-home-02.webp', alt: 'พื้นหินเกล็ดรอบต้นไม้และทางเดินข้างบ้าน' },
      { src: '/images/stone-home-03.webp', alt: 'งานหินเกล็ดข้างบ้านและแนวกำแพง' },
      { src: '/images/stone-home-04.webp', alt: 'ลานหินเกล็ดบริเวณทางเข้าบ้าน' },
      { src: '/images/stone-home-05.webp', alt: 'พื้นหินเกล็ดตลอดแนวด้านข้างบ้าน' },
    ],
  },
  {
    id: 'speed-bump-work', category: 'speed-bump', title: 'งานลูกระนาดยางมะตอย',
    location: '', description: 'จัดทำลูกระนาดและเครื่องหมายชะลอความเร็ว',
    images: [
      { src: '/images/speed-bump-job.webp', alt: 'ภาพหน้างานลูกระนาดยางมะตอย' },
      { src: '/images/speed-bump-job-02.webp', alt: 'รถบดบดอัดงานลูกระนาดยางมะตอย' },
      { src: '/images/speed-bump-job-03.webp', alt: 'ทีมงานเกลี่ยยางมะตอยสำหรับลูกระนาด' },
      { src: '/images/speed-bump-job-04.webp', alt: 'ผิวลูกระนาดยางมะตอยระหว่างเก็บงาน' },
      { src: '/images/speed-bump-job-05.webp', alt: 'งานปูและปรับผิวลูกระนาดยางมะตอย' },
    ],
  },
  {
    id: 'parking-marking', category: 'marking', title: 'งานตีเส้นจราจร',
    location: '', description: 'จัดช่องจอดรถและพื้นที่ใช้งานให้เป็นระเบียบ',
    images: [{ src: '/images/marking-job.webp', alt: 'ภาพหน้างานตีเส้นจราจร' }],
  },
];
