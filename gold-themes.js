// Preview only: tint formerly white/ivory surfaces; retain the site's brand colors.
import { themeStyles } from './light-surface-preview.js';
export { themeStyles };

const originalColors = {
  header: '#164F9F', nav: '#E0BC68', ink: '#091F59', muted: '#566077',
  accent: '#AF8426', accentInk: '#83651E', call: '#0077B6', navInk: '#143D75',
  highlight: '#F0D68C',
};

export const colorThemes = [
  {
    id: '1', name: 'ทองแชมเปญ', recommended: true,
    description: 'ทองอ่อนนุ่ม แววแชมเปญบาง ๆ ดูสุภาพและพรีเมี่ยม',
    colors: { page: '#F7EEDC', card: '#FBF4E6', secondary: '#F0E0BE' },
    finish: { light: '#FFFCF6', angle: 125, glow: 0.16, band: 44 },
  },
  {
    id: '2', name: 'ทองไข่มุก', recommended: false,
    description: 'ทองอมมุกละมุน ประกายละเอียด สะอาดและสบายตา',
    colors: { page: '#F5F0E6', card: '#FBF7EE', secondary: '#E9DFCB' },
    finish: { light: '#FFFDF8', angle: 135, glow: 0.18, band: 38 },
  },
  {
    id: '3', name: 'ทองน้ำผึ้งอ่อน', recommended: false,
    description: 'ทองน้ำผึ้งจาง ๆ แววอบอุ่น ให้ภาพผลงานดูโดดเด่น',
    colors: { page: '#F8EDCC', card: '#FCF3DB', secondary: '#EEDFAD' },
    finish: { light: '#FFFBEF', angle: 112, glow: 0.14, band: 50 },
  },
  {
    id: '4', name: 'ทองงาช้าง', recommended: false,
    description: 'ทองงาช้างสว่าง แววนุ่ม โปร่ง เรียบและเป็นทางการ',
    colors: { page: '#F8F3E3', card: '#FCF8ED', secondary: '#EEE5CC' },
    finish: { light: '#FFFFF8', angle: 145, glow: 0.16, band: 42 },
  },
  {
    id: '5', name: 'ทองทราย', recommended: false,
    description: 'ทองอมทรายสุขุม แววซาตินบาง ๆ ดูมั่นคงและเรียบหรู',
    colors: { page: '#F4ECDF', card: '#F7EFE4', secondary: '#E0D1B9' },
    finish: { light: '#FEFAF3', angle: 118, glow: 0.12, band: 56 },
  },
].map(theme => ({ ...theme, colors: { ...originalColors, ...theme.colors } }));
