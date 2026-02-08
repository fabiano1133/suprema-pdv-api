/**
 * Regras de ouro (formatação):
 * - Apenas letras, números, traços (-) e underlines (_).
 * - Sem espaços, acentos, cedilhas ou símbolos (integração ERP/marketplaces).
 *
 * Formato (regra do usuário):
 * TIPO DE PRODUTO - ABREVIACAO - BANHO/COR - SEQUENCIA ALEATORIA HEXADECIMAL
 * Ex.: BR-PRZRC14-RH-3FA9C1
 */
import { randomBytes } from 'crypto';

export function generateSkuFromProductName(productName: string): string {
  const trimmed = productName?.trim() ?? '';
  if (!trimmed) {
    throw new Error('Product name is required to generate SKU');
  }

  const normalized = removeAccentsAndSymbols(trimmed).toUpperCase().trim();
  const words = normalized.split(/[\s_-]+/).filter(Boolean);

  const type = detectProductType(words) ?? 'PR'; // PR = Produto genérico
  const color = detectProductColor(words) ?? 'SC'; // SC = Sem cor
  const abbr = buildAbbreviation(words) || 'GEN';
  const hex = randomBytes(RANDOM_HEX_BYTES).toString('hex').toUpperCase();

  return `${type}-${abbr}-${color}-${hex}`;
}

/**
 * Remove acentos, cedilhas e símbolos. Mantém apenas letras, números, espaços, hífen e underline.
 */
function removeAccentsAndSymbols(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const RANDOM_HEX_BYTES = 3; // 3 bytes => 6 hex chars

const PRODUCT_TYPE_MAP = new Map<string, string>([
  ['BRINCO', 'BR'],
  ['COLAR', 'CL'],
  ['ANEL', 'AN'],
  ['PULSEIRA', 'PL'],
  ['CONJUNTO', 'CJ'],
]);

const PRODUCT_COLOR_MAP = new Map<string, string>([
  ['DOURADO', 'DO'],
  ['OURO', 'DO'],
  ['RODIO', 'RH'],
  ['ROSE', 'RO'],
]);

const STOPWORDS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'COM', 'PARA']);

function detectProductType(words: string[]): string | null {
  for (const w of words) {
    const mapped = PRODUCT_TYPE_MAP.get(w);
    if (mapped) return mapped;
  }
  return null;
}

function detectProductColor(words: string[]): string | null {
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    // "RODIO NEGRO" => RN
    if (w === 'RODIO' && words[i + 1] === 'NEGRO') return 'RN';
    const mapped = PRODUCT_COLOR_MAP.get(w);
    if (mapped) return mapped;
  }
  return null;
}

function isTypeWord(w: string): boolean {
  return PRODUCT_TYPE_MAP.has(w);
}

function isColorWord(words: string[], idx: number): boolean {
  const w = words[idx];
  if (w === 'NEGRO' && words[idx - 1] === 'RODIO') return true;
  if (w === 'RODIO' && words[idx + 1] === 'NEGRO') return true;
  return PRODUCT_COLOR_MAP.has(w);
}

/**
 * ABREVIACAO:
 * - ignora tipo de produto e banho/cor
 * - ignora stopwords
 * - mantém dígitos quando existirem no token (ex.: 18K -> 18, 45CM -> 45)
 * - letras viram até 3 chars (ABC...), números viram os dígitos
 * - limita tamanho final para manter SKU curto
 */
function buildAbbreviation(words: string[]): string {
  const segments: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!w) continue;
    if (STOPWORDS.has(w)) continue;
    if (isTypeWord(w)) continue;
    if (isColorWord(words, i)) {
      // consome "NEGRO" se for o par RODIO NEGRO
      if (w === 'RODIO' && words[i + 1] === 'NEGRO') i++;
      continue;
    }

    const digits = w.replace(/\D/g, '');
    const letters = w.replace(/[^A-Z]/g, '');

    if (letters) segments.push(letters.slice(0, 3));
    if (digits) segments.push(digits);

    if (segments.join('').length >= 12) break; // limite prático
  }
  return segments.join('');
}
