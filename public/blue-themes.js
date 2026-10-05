export { themeStyles } from './light-surface-preview.js';

// Preview only: change formerly white/ivory surfaces; preserve the site's brand colors.
const originalColors = { header:'#164F9F', nav:'#E0BC68', ink:'#091F59', muted:'#566077', accent:'#AF8426', accentInk:'#83651E', call:'#0077B6', navInk:'#143D75', highlight:'#F0D68C' };
export const colorThemes = [
  {
    id: '1', name: 'ฟ้าไข่มุก', recommended: true,
    description: 'ฟ้าอ่อนนุ่ม แววไข่มุกบาง ๆ ดูสะอาดและพรีเมี่ยม',
    colors: { page: '#E7F2FC', card: '#EDF7FE', secondary: '#D9EAF7' },
    finish: { light: '#F2F9FF', angle: 125, glow: 0.18, band: 44 },
  },
  {
    id: '2', name: 'ฟ้าคริสตัล', recommended: false,
    description: 'ฟ้าใสชัดขึ้น พร้อมประกายเรียบ ๆ ให้ความรู้สึกทันสมัย',
    colors: { page: '#D9EDFF', card: '#E4F2FF', secondary: '#CAE2F8' },
    finish: { light: '#EFF8FF', angle: 135, glow: 0.16, band: 38 },
  },
  {
    id: '3', name: 'ฟ้าเงิน', recommended: false,
    description: 'ฟ้าอมเงิน แววโลหะละเอียด สุขุมและเป็นทางการ',
    colors: { page: '#E3EBF3', card: '#EAF1F8', secondary: '#D8E2EC' },
    finish: { light: '#F1F6FC', angle: 112, glow: 0.14, band: 50 },
  },
  {
    id: '4', name: 'ฟ้าไอซ์', recommended: false,
    description: 'ฟ้าอ่อนอมเขียว แววใสเย็นตา โปร่งและสบายตา',
    colors: { page: '#E0F5F8', card: '#EBFAFB', secondary: '#D3EEF2' },
    finish: { light: '#F0FDFF', angle: 145, glow: 0.18, band: 42 },
  },
  {
    id: '5', name: 'ฟ้าอมเทา', recommended: false,
    description: 'ฟ้าอมเทานุ่ม แววซาตินบาง ๆ เรียบ เท่ และน่าเชื่อถือ',
    colors: { page: '#E4EEF6', card: '#E7F0F7', secondary: '#D0E0ED' },
    finish: { light: '#EEF5FB', angle: 118, glow: 0.12, band: 56 },
  },
].map(theme => ({ ...theme, colors: { ...originalColors, ...theme.colors } }));
