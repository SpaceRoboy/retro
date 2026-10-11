export const SCHEMA_VERSION = 1;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizePoint(x, y, width, height) {
  if (!(width > 0 && height > 0)) throw new Error('Dimensions d’image invalides');
  return { x: clamp(x / width, 0, 1), y: clamp(y / height, 0, 1) };
}

export function denormalizeMarker(marker, width, height) {
  return {
    x: marker.x * width,
    y: marker.y * height,
    r: marker.radius * Math.min(width, height),
  };
}

export function validateProject(project) {
  if (!project || project.schemaVersion !== SCHEMA_VERSION) return { ok: false, error: 'Version de fichier non prise en charge.' };
  if (!project.wall || typeof project.wall.photoDataUrl !== 'string' || !project.wall.photoDataUrl.startsWith('data:image/')) return { ok: false, error: 'Photo du mur absente ou invalide.' };
  if (!Number.isFinite(project.wall.width) || !Number.isFinite(project.wall.height) || project.wall.width <= 0 || project.wall.height <= 0 || project.wall.width > 30000 || project.wall.height > 30000) return { ok: false, error: 'Dimensions de la photo invalides.' };
  if (!Array.isArray(project.blocks)) return { ok: false, error: 'Liste de blocs invalide.' };
  const ids = new Set();
  for (const block of project.blocks) {
    if (!block.id || ids.has(block.id)) return { ok: false, error: 'Identifiant de bloc manquant ou dupliqué.' };
    ids.add(block.id);
    if (!Array.isArray(block.markers)) return { ok: false, error: `Marqueurs invalides dans « ${block.name || 'bloc'} ».` };
    for (const m of block.markers) {
      if (![m.x, m.y, m.radius].every(Number.isFinite) || m.x < 0 || m.x > 1 || m.y < 0 || m.y > 1 || m.radius <= 0 || m.radius > 1) {
        return { ok: false, error: `Coordonnées invalides dans « ${block.name || 'bloc'} ».` };
      }
      if (typeof m.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(m.color)) return { ok: false, error: 'Couleur de marqueur invalide.' };
    }
  }
  return { ok: true };
}

// Minimal ZIP writer/reader using the ZIP STORE method. Files created here are standards-compliant ZIP archives.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  return table;
})();
export function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
const u16 = (n) => [n & 255, (n >>> 8) & 255];
const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
function concat(chunks) { const len = chunks.reduce((n, c) => n + c.length, 0); const out = new Uint8Array(len); let offset = 0; for (const c of chunks) { out.set(c, offset); offset += c.length; } return out; }
export function createZip(entries) {
  const encoder = new TextEncoder(); const locals = []; const centrals = []; let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name); const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(data);
    const local = concat([new Uint8Array([0x50,0x4b,0x03,0x04]), new Uint8Array([...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]), name, data]);
    const central = concat([new Uint8Array([0x50,0x4b,0x01,0x02]), new Uint8Array([...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const centralDir = concat(centrals); const end = new Uint8Array([0x50,0x4b,0x05,0x06, ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(centralDir.length), ...u32(offset), ...u16(0)]);
  return concat([...locals, centralDir, end]);
}
export function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); const decoder = new TextDecoder(); const entries = {};
  let eocd = -1;
  for (let i = Math.max(0, bytes.length - 65557); i <= bytes.length - 22; i++) if (view.getUint32(i, true) === 0x06054b50) eocd = i;
  if (eocd < 0) throw new Error('Archive ZIP invalide : répertoire central absent.');
  const count = view.getUint16(eocd + 10, true); let pos = view.getUint32(eocd + 16, true);
  for (let i = 0; i < count; i++) {
    if (view.getUint32(pos, true) !== 0x02014b50) throw new Error('Archive ZIP invalide.');
    const method = view.getUint16(pos + 10, true); if (method !== 0) throw new Error('Cette archive utilise une compression non prise en charge. Réexporte-la depuis ClimbSketch.');
    const size = view.getUint32(pos + 24, true); const nameLen = view.getUint16(pos + 28, true); const extraLen = view.getUint16(pos + 30, true); const commentLen = view.getUint16(pos + 32, true); const localOffset = view.getUint32(pos + 42, true);
    const name = decoder.decode(bytes.slice(pos + 46, pos + 46 + nameLen));
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Entrée ZIP invalide.');
    const ln = view.getUint16(localOffset + 26, true); const le = view.getUint16(localOffset + 28, true); const dataStart = localOffset + 30 + ln + le;
    const data = bytes.slice(dataStart, dataStart + size); const expectedCrc = view.getUint32(pos + 16, true); if (crc32(data) !== expectedCrc) throw new Error(`Fichier endommagé dans l’archive : ${name}`);
    entries[name] = data; pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}
