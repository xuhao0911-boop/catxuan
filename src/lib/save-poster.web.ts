import { Asset } from 'expo-asset';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import type { PosterModel } from './poster';

export async function savePoster(_ref: RefObject<View | null>, model: PosterModel) {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1440;
  const context = canvas.getContext('2d'); if (!context) throw new Error('Image export unavailable');
  await document.fonts.ready;
  context.fillStyle = '#FFFFFF'; context.fillRect(0, 0, 1080, 1440);
  const text = (value: string, x: number, y: number, size: number, weight = 400, color = '#203D32') => { context.fillStyle = color; context.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`; context.textAlign = 'left'; context.textBaseline = 'top'; context.fillText(value, x, y); };
  const wrap = (value: string, x: number, y: number, size: number, width: number, lineHeight: number, maxLines = 2, weight = 400, color = '#203D32') => {
    context.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
    const lines: string[] = []; let line = '';
    for (const letter of Array.from(value)) { if (context.measureText(line + letter).width > width && line) { lines.push(line); line = letter; } else line += letter; }
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((value, i) => text(value + (i === maxLines - 1 && lines.length > maxLines ? '…' : ''), x, y + i * lineHeight, size, weight, color));
  };
  context.fillStyle = '#315C48'; context.beginPath(); context.roundRect(60, 60, 82, 82, 26); context.fill();
  context.fillStyle = '#F3F7EB'; for (const [x, y, rx, ry] of [[100, 112, 17, 13], [80, 92, 6, 9], [93, 82, 6, 9], [109, 82, 6, 9], [122, 94, 6, 9]]) { context.beginPath(); context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); context.fill(); }
  text('CatXuan', 165, 78, 49, 700);
  text(model.kind === 'match' ? '我的选猫清单' : '猫种图鉴', model.kind === 'match' ? 782 : 850, 91, 31, 400, '#62756B');
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = Asset.fromModule(model.asset).uri; });
  const crop = model.crop || { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  const scale = Math.min(960 / crop.width, 724 / crop.height);
  const w = crop.width * scale, h = crop.height * scale;
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 60 + (960 - w) / 2, 180 + (724 - h) / 2, w, h);
  wrap(model.breed.name, 65, 955, model.breed.name.length > 12 ? 58 : 74, 950, 85, 2, 700);
  text(model.breed.en, 68, 1137, 34, 400, '#62756B');
  text(model.attributes, 68, 1198, 37, 500, '#315C48');
  wrap(model.variant, 68, 1255, 32, 940, 42, 2, 400, '#62756B');
  context.fillStyle = '#E5EEE6'; context.fillRect(60, 1365, 960, 2);
  text(model.kind === 'match' ? (model.note || '认识与你合拍的猫咪') : '每一种猫咪，都值得被认识', 68, 1390, 30, 400, '#62756B');
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Image export failed')), 'image/png'));
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `CatXuan-${model.breed.id}-${model.color || 'default'}-${model.form || 'default'}.png`; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  return '图片已生成';
}

export async function shareDescription(message: string) {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(message); return '介绍已复制'; }
  const link = document.createElement('a'); const blob = new Blob([message], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); link.href = url; link.download = 'CatXuan.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); return '介绍已导出';
}
