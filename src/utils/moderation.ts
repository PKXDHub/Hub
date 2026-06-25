/**
 * Moderation utility for PKXD Central comments
 * Filters out swear words, insults, scams, hacks, and coin/gem generator terms
 */

const ILLICIT_WORDS_PATTERN = [
  // Swear words & Vulgar terms (Portuguese)
  'merda', 'porra', 'bosta', 'filho da puta', 'filho da p', 'caralho', 'puta', 'cuzao', 'cuzao', 
  'viado', 'cuzão', 'pinto', 'rola', 'vagina', 'arrombado', 'foder', 'foda-se', 'fode', 'fdp', 
  'pqp', 'cacete', 'bunda', 'otario', 'corno', 'imbecil', 'retardado', 'idiota', 'desgracado',
  
  // Scams, Hacks & Generators (Common exploits targeted at players)
  'hack', 'mod menu', 'cheat', 'cheater', 'gerador', 'gemas gratis', 'gemas gratis', 'gemas grátis', 
  'gema gratis', 'gerador de gemas', 'hackear', 'gerador de moedas', 'moedas gratis', 'moedas grátis', 
  'apk mod', 'pk xd hack', 'pkxd hack', 'bug de gemas', 'bug de moedas', 'hackeado', 'robux gratis',
  'gratis gemas', 'moedas infinitas', 'gemas infinitas', 'cheat engine', 'hacker'
];

/**
 * Normalizes text to easily find bypass attempts (removes accents, special characters, and double spaces)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9\s]/g, '') // Keep only letters, numbers, and spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Checks if a text contains any illicit, offensive, or scam words.
 * Returns an object indicating if it is illicit and which words matched.
 */
export function checkIsIllicit(text: string): { isIllicit: boolean; matchedWords: string[] } {
  const normalized = normalizeText(text);
  const matchedWords: string[] = [];

  // 1. Direct word / phrase matching
  for (const pattern of ILLICIT_WORDS_PATTERN) {
    if (normalized.includes(pattern)) {
      matchedWords.push(pattern);
    }
  }

  // 2. Extra checks for hack website/link patterns
  const linkPatterns = [/\.gg\//, /\.xyz/, /\.ru/, /freegems/];
  for (const pattern of linkPatterns) {
    if (pattern.test(normalized)) {
      matchedWords.push('link_suspeito');
    }
  }

  return {
    isIllicit: matchedWords.length > 0,
    matchedWords
  };
}
