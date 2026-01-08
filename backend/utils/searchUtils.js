/**
 * Search Utilities for B2B Marketplace
 * 
 * Provides category-specific synonym expansion and spelling correction
 * for Apparel & Accessories and Jewelry categories.
 * 
 * IMPORTANT: These maps are intentionally separated by category to prevent
 * cross-category pollution (e.g., jewelry terms affecting apparel searches).
 */

// =============================================================================
// CATEGORY-SPECIFIC SYNONYM MAPS
// =============================================================================

/**
 * Apparel & Accessories Synonyms
 * Maps common search terms to related words for better matching
 */
const APPAREL_SYNONYMS = {
  // Materials
  cotton: ['soft', 'breathable', 'natural', 'organic'],
  silk: ['silky', 'satin', 'luxurious'],
  wool: ['woolen', 'cashmere', 'warm'],
  linen: ['flax', 'breathable', 'summer'],
  polyester: ['synthetic', 'poly'],
  denim: ['jeans', 'jean'],
  leather: ['genuine leather', 'faux leather', 'leatherette'],
  
  // Garment Types
  saree: ['sari', 'drape', 'sarees', 'saris'],
  sari: ['saree', 'drape', 'sarees', 'saris'],
  kurti: ['tunic', 'kurta', 'kurtis'],
  kurta: ['kurti', 'tunic', 'kurtas'],
  dupatta: ['stole', 'scarf', 'dupattas', 'chunni'],
  lehenga: ['lehanga', 'ghagra', 'skirt'],
  shawl: ['wrap', 'stole', 'pashmina'],
  shirt: ['top', 'blouse', 'shirts'],
  pant: ['trouser', 'pants', 'trousers', 'bottom'],
  dress: ['gown', 'frock', 'dresses'],
  suit: ['suits', 'formal wear'],
  
  // Business Terms
  fabric: ['cloth', 'textile', 'material', 'fabrics'],
  cloth: ['fabric', 'textile', 'material'],
  export: ['international', 'overseas', 'global'],
  bulk: ['wholesale', 'large quantity', 'bulk order'],
  wholesale: ['bulk', 'bulk order', 'b2b'],
  
  // Styles
  ethnic: ['traditional', 'indian', 'desi'],
  traditional: ['ethnic', 'classic', 'heritage'],
  western: ['modern', 'contemporary'],
  casual: ['everyday', 'informal'],
  formal: ['office', 'business', 'professional'],
  
  // Patterns
  printed: ['print', 'prints', 'block print'],
  embroidered: ['embroidery', 'zari', 'thread work'],
  handloom: ['handwoven', 'hand woven', 'artisan'],
};

/**
 * Jewelry Synonyms (Fine + Imitation/Artificial/Fashion Jewelry)
 * Maps common search terms to related words for better matching
 */
const JEWELRY_SYNONYMS = {
  // Metals & Materials
  gold: ['golden', 'yellow gold', '22k', '24k', '18k', '14k', 'gold plated'],
  silver: ['sterling', '925', 'sterling silver', 'silver plated'],
  platinum: ['white gold'],
  brass: ['bronze', 'copper'],
  
  // Imitation/Fashion Jewelry Terms (IMPORTANT for this marketplace)
  imitation: ['artificial', 'fashion', 'faux', 'costume', 'fake'],
  artificial: ['imitation', 'fashion', 'faux', 'costume', 'synthetic'],
  fashion: ['imitation', 'artificial', 'costume', 'trendy'],
  faux: ['imitation', 'artificial', 'fashion'],
  costume: ['fashion', 'imitation', 'artificial'],
  alloy: ['metal mix', 'base metal', 'mixed metal'],
  plated: ['gold plated', 'silver plated', 'rhodium plated'],
  
  // Jewelry Types
  ring: ['band', 'rings', 'finger ring'],
  rings: ['ring', 'band', 'finger ring'],
  necklace: ['chain', 'pendant', 'necklaces', 'neck piece', 'haar'],
  chain: ['necklace', 'chains'],
  pendant: ['locket', 'pendants'],
  earring: ['studs', 'drops', 'hoops', 'jhumka', 'earrings', 'ear ring'],
  earrings: ['studs', 'drops', 'hoops', 'jhumka', 'earring', 'ear rings'],
  studs: ['earrings', 'ear studs'],
  jhumka: ['jhumkas', 'jhumki', 'earrings', 'drops'],
  bangle: ['bangles', 'bracelet', 'kada', 'kangan'],
  bangles: ['bangle', 'bracelet', 'kada', 'kangan', 'churis'],
  bracelet: ['bangle', 'bracelets', 'kada', 'wrist band'],
  kada: ['bangle', 'bracelet', 'kadas'],
  anklet: ['payal', 'anklets', 'ankle bracelet', 'pajeb'],
  payal: ['anklet', 'payals', 'pajeb'],
  set: ['jewelry set', 'matching set', 'sets', 'jewellery set', 'necklace set'],
  
  // Stones & Gems
  diamond: ['gemstone', 'stone', 'diamonds', 'solitaire'],
  kundan: ['polki', 'traditional stone', 'kundans', 'kundan work'],
  polki: ['kundan', 'uncut diamond', 'polkis'],
  'american diamond': ['ad', 'cubic zirconia', 'cz', 'american diamonds'],
  ad: ['american diamond', 'cubic zirconia', 'cz'],
  cz: ['cubic zirconia', 'american diamond', 'ad'],
  pearl: ['pearls', 'moti'],
  ruby: ['rubies', 'manik'],
  emerald: ['emeralds', 'panna'],
  meenakari: ['enamel', 'meena', 'minakari'],
  
  // Styles
  traditional: ['ethnic', 'indian', 'classic', 'heritage'],
  ethnic: ['traditional', 'indian', 'desi'],
  bridal: ['wedding', 'bride', 'marriage', 'dulhan'],
  temple: ['temple jewelry', 'temple jewellery', 'south indian'],
  antique: ['vintage', 'oxidized', 'oxidised', 'old style'],
  oxidized: ['oxidised', 'antique', 'blackened'],
  jadau: ['jadav', 'traditional', 'royal'],
  
  // British vs American spelling
  jewellery: ['jewelry'],
  jewelry: ['jewellery'],
};

// =============================================================================
// COMMON MISSPELLING CORRECTIONS
// =============================================================================

/**
 * Common spelling mistakes in search queries
 * Maps misspelled words to correct spellings
 */
const COMMON_MISSPELLINGS = {
  // Apparel misspellings
  cottn: 'cotton',
  coton: 'cotton',
  cottton: 'cotton',
  saari: 'saree',
  saaree: 'saree',
  sarre: 'saree',
  kurita: 'kurta',
  kurthi: 'kurti',
  dupata: 'dupatta',
  dupata: 'dupatta',
  lehnga: 'lehenga',
  lengha: 'lehenga',
  shwal: 'shawl',
  pashmna: 'pashmina',
  fabrik: 'fabric',
  fabirc: 'fabric',
  cloths: 'cloth',
  silck: 'silk',
  
  // Jewelry misspellings
  jwelry: 'jewelry',
  jewlery: 'jewelry',
  jewellry: 'jewelry',
  jewelery: 'jewelry',
  jewlry: 'jewelry',
  jwellery: 'jewellery',
  imitaton: 'imitation',
  imtation: 'imitation',
  imitaion: 'imitation',
  artifical: 'artificial',
  artifcial: 'artificial',
  artficial: 'artificial',
  neklace: 'necklace',
  necklas: 'necklace',
  neclace: 'necklace',
  neckace: 'necklace',
  earing: 'earring',
  earings: 'earrings',
  earring: 'earring',
  erring: 'earring',
  errings: 'earrings',
  bangel: 'bangle',
  bangels: 'bangles',
  banles: 'bangles',
  bracelat: 'bracelet',
  braclet: 'bracelet',
  pendnat: 'pendant',
  pendent: 'pendant',
  dimond: 'diamond',
  diamnd: 'diamond',
  diamod: 'diamond',
  kundn: 'kundan',
  kundun: 'kundan',
  golld: 'gold',
  gld: 'gold',
  silvr: 'silver',
  sliver: 'silver',
  ankel: 'anklet',
  ankelt: 'anklet',
  
  // General B2B misspellings
  wholsale: 'wholesale',
  wholesle: 'wholesale',
  whoelsale: 'wholesale',
  exprt: 'export',
  exort: 'export',
  bulck: 'bulk',
};

// =============================================================================
// SEARCH HELPER FUNCTIONS
// =============================================================================

/**
 * Detects which category a search query likely belongs to
 * @param {string} query - The search query
 * @returns {string|null} - 'Apparel & Accessories', 'Jewelry', or null
 */
function detectCategory(query) {
  const lowerQuery = query.toLowerCase();
  
  // Jewelry-specific keywords
  const jewelryKeywords = [
    'ring', 'necklace', 'earring', 'bangle', 'bracelet', 'pendant', 'chain',
    'gold', 'silver', 'diamond', 'kundan', 'polki', 'pearl', 'ruby', 'emerald',
    'jewelry', 'jewellery', 'jewel', 'imitation', 'artificial', 'fashion jewelry',
    'studs', 'hoops', 'jhumka', 'anklet', 'payal', 'meenakari', 'jadau',
    'ad ', 'cz ', 'american diamond', 'temple jewelry', 'bridal jewelry',
    'oxidized', 'antique jewelry', 'kada', 'mangalsutra', 'nose pin'
  ];
  
  // Apparel-specific keywords
  const apparelKeywords = [
    'saree', 'sari', 'kurti', 'kurta', 'dupatta', 'lehenga', 'shawl',
    'cotton', 'silk', 'fabric', 'cloth', 'textile', 'dress', 'shirt',
    'pant', 'trouser', 'suit', 'blouse', 'top', 'gown', 'ethnic wear',
    'western wear', 'formal wear', 'casual wear', 'denim', 'wool',
    'pashmina', 'handloom', 'embroidered', 'printed', 'stole'
  ];
  
  // Check for jewelry keywords
  for (const keyword of jewelryKeywords) {
    if (lowerQuery.includes(keyword)) {
      return 'Jewelry';
    }
  }
  
  // Check for apparel keywords
  for (const keyword of apparelKeywords) {
    if (lowerQuery.includes(keyword)) {
      return 'Apparel & Accessories';
    }
  }
  
  return null; // Category not detected
}

/**
 * Corrects common spelling mistakes in a query
 * @param {string} query - The search query
 * @returns {string} - Query with corrected spellings
 */
function correctSpelling(query) {
  let correctedQuery = query.toLowerCase();
  
  // Sort by length descending to replace longer matches first
  const sortedMisspellings = Object.entries(COMMON_MISSPELLINGS)
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [misspelled, correct] of sortedMisspellings) {
    // Use word boundary matching to avoid partial replacements
    const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
    correctedQuery = correctedQuery.replace(regex, correct);
  }
  
  return correctedQuery;
}

/**
 * Expands a query with synonyms based on category
 * @param {string} query - The search query
 * @param {string|null} category - The category to use for synonyms
 * @returns {string} - Expanded query with synonyms
 */
function expandWithSynonyms(query, category) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const expandedTerms = new Set(words);
  
  // Select appropriate synonym map based on category
  let synonymMap = {};
  
  if (category === 'Jewelry') {
    synonymMap = JEWELRY_SYNONYMS;
  } else if (category === 'Apparel & Accessories') {
    synonymMap = APPAREL_SYNONYMS;
  } else {
    // If no category specified, use both maps but limit expansion
    synonymMap = { ...APPAREL_SYNONYMS, ...JEWELRY_SYNONYMS };
  }
  
  // Expand each word with its synonyms
  for (const word of words) {
    if (synonymMap[word]) {
      // Add first 3 synonyms to avoid query explosion
      synonymMap[word].slice(0, 3).forEach(syn => expandedTerms.add(syn));
    }
  }
  
  // MongoDB text search uses space-separated terms
  // Wrap multi-word synonyms in quotes for phrase matching
  return Array.from(expandedTerms)
    .map(term => term.includes(' ') ? `"${term}"` : term)
    .join(' ');
}

/**
 * Processes a search query with all enhancements
 * @param {string} rawQuery - The original search query
 * @param {string|null} selectedCategory - Category filter from frontend (if any)
 * @returns {object} - Processed search parameters
 */
function processSearchQuery(rawQuery, selectedCategory = null) {
  // Step 1: Trim and normalize
  let query = rawQuery.trim().toLowerCase();
  
  if (!query) {
    return { query: '', expandedQuery: '', category: null, corrected: false };
  }
  
  // Step 2: Correct spelling mistakes
  const originalQuery = query;
  query = correctSpelling(query);
  const wasCorrected = query !== originalQuery;
  
  // Step 3: Detect category if not provided
  const detectedCategory = selectedCategory || detectCategory(query);
  
  // Step 4: Expand query with category-specific synonyms
  const expandedQuery = expandWithSynonyms(query, detectedCategory);
  
  return {
    originalQuery: rawQuery,
    correctedQuery: query,
    expandedQuery: expandedQuery,
    category: detectedCategory,
    corrected: wasCorrected,
  };
}

/**
 * Generates regex patterns for partial/fuzzy matching (fallback)
 * @param {string} query - The search query
 * @returns {RegExp} - Regex pattern for partial matching
 */
function generatePartialMatchRegex(query) {
  // Escape special regex characters
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Allow for partial word matching
  // This handles cases like "cott" matching "cotton"
  return new RegExp(escaped, 'i');
}

/**
 * Builds MongoDB query for text search with category filter
 * @param {string} expandedQuery - The processed search query
 * @param {string|null} category - Category filter
 * @returns {object} - MongoDB query object
 */
function buildSearchQuery(expandedQuery, category) {
  const query = {
    $text: { $search: expandedQuery }
  };
  
  // Add category filter if specified
  if (category) {
    query.category = category;
  }
  
  return query;
}

/**
 * Builds regex-based fallback query for when text search fails
 * @param {string} searchTerms - Space-separated search terms
 * @param {string|null} category - Category filter
 * @returns {object} - MongoDB query object
 */
function buildFallbackQuery(searchTerms, category) {
  const terms = searchTerms.split(/\s+/).filter(t => t.length > 1);
  
  // Create regex patterns for each term
  const regexConditions = terms.map(term => {
    const pattern = generatePartialMatchRegex(term);
    return {
      $or: [
        { name: pattern },
        { description: pattern },
        { tags: pattern },
        { searchKeywords: pattern },
        { useCases: pattern },
        { category: pattern },
        { subcategory: pattern }
      ]
    };
  });
  
  const query = {
    $and: regexConditions.length > 0 ? regexConditions : [{}]
  };
  
  // Add category filter if specified
  if (category) {
    query.category = category;
  }
  
  return query;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  APPAREL_SYNONYMS,
  JEWELRY_SYNONYMS,
  COMMON_MISSPELLINGS,
  detectCategory,
  correctSpelling,
  expandWithSynonyms,
  processSearchQuery,
  generatePartialMatchRegex,
  buildSearchQuery,
  buildFallbackQuery,
};
