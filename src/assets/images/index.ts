import heroPakistaniFeast from './hero_pakistani_feast_1791648599401.jpg';
import specialMuttonKarahi from './special_mutton_karahi_1791648611986.jpg';
import dishChickenBiryani from './dish_chicken_biryani_1791648623964.jpg';
import dessertGulabJamunKheer from './dessert_gulab_jamun_kheer_1791648636566.jpg';
import dishGulabJamun from './dish_gulab_jamun_1791806796117.jpg';
import dishKheer from './dish_kheer_1791806206708.jpg';
import dishMalaiBoti from './dish_malai_boti_1791648671107.jpg';
import dishSeekhKebab from './dish_seekh_kebab_1791648685182.jpg';
import dishChickenKarahi from './dish_chicken_karahi_1791648696527.jpg';
import dishParathaRoll from './dish_paratha_roll_1791648709001.jpg';
import dishVegPulao from './dish_veg_pulao_1791648764948.jpg';
import dishPaneerRoll from './dish_paneer_roll_1791648778859.jpg';
import dishMintMargarita from './dish_mint_margarita_1791648792040.jpg';
import dishDoodhPattiChai from './dish_doodh_patti_chai_1791648803039.jpg';

export {
  heroPakistaniFeast,
  specialMuttonKarahi,
  dishChickenBiryani,
  dessertGulabJamunKheer,
  dishGulabJamun,
  dishKheer,
  dishMalaiBoti,
  dishSeekhKebab,
  dishChickenKarahi,
  dishParathaRoll,
  dishVegPulao,
  dishPaneerRoll,
  dishMintMargarita,
  dishDoodhPattiChai,
};

/**
 * Direct lookup map from filename to Vite-processed asset bundle URL
 */
export const ASSET_IMAGES_BY_FILENAME: Record<string, string> = {
  'hero_pakistani_feast_1791648599401.jpg': heroPakistaniFeast,
  'special_mutton_karahi_1791648611986.jpg': specialMuttonKarahi,
  'dish_chicken_biryani_1791648623964.jpg': dishChickenBiryani,
  'dessert_gulab_jamun_kheer_1791648636566.jpg': dessertGulabJamunKheer,
  'dish_gulab_jamun_1791806796117.jpg': dishGulabJamun,
  'dish_kheer_1791806206708.jpg': dishKheer,
  'dish_malai_boti_1791648671107.jpg': dishMalaiBoti,
  'dish_seekh_kebab_1791648685182.jpg': dishSeekhKebab,
  'dish_chicken_karahi_1791648696527.jpg': dishChickenKarahi,
  'dish_paratha_roll_1791648709001.jpg': dishParathaRoll,
  'dish_veg_pulao_1791648764948.jpg': dishVegPulao,
  'dish_paneer_roll_1791648778859.jpg': dishPaneerRoll,
  'dish_mint_margarita_1791648792040.jpg': dishMintMargarita,
  'dish_doodh_patti_chai_1791648803039.jpg': dishDoodhPattiChai,
};

/**
 * Direct lookup map by menu item ID
 */
export const MENU_ITEM_IMAGES: Record<number, string> = {
  1: dishMalaiBoti,
  2: dishSeekhKebab,
  3: specialMuttonKarahi,
  4: dishChickenKarahi,
  5: dishChickenBiryani,
  6: dishVegPulao,
  7: dishParathaRoll,
  8: dishPaneerRoll,
  9: dishMintMargarita,
  10: dishDoodhPattiChai,
  11: dishGulabJamun,
  12: dishKheer,
};

/**
 * Elegant SVG fallback placeholder when a food image fails to load
 */
export function getFoodPlaceholderSvg(dishName: string = 'Karachi Bites', category: string = 'Authentic'): string {
  const safeName = dishName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = category.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="kbBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B1924" />
        <stop offset="50%" stop-color="#262232" />
        <stop offset="100%" stop-color="#14121A" />
      </linearGradient>
      <radialGradient id="kbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#D7AE55" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#D7AE55" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="800" height="600" fill="url(#kbBg)" />
    <circle cx="400" cy="300" r="280" fill="url(#kbGlow)" />
    <!-- Filigree decorative frame -->
    <rect x="30" y="30" width="740" height="540" rx="16" fill="none" stroke="#D7AE55" stroke-opacity="0.3" stroke-width="1.5" />
    <rect x="42" y="42" width="716" height="516" rx="12" fill="none" stroke="#D7AE55" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="6,4" />
    
    <!-- Central Culinary Symbol -->
    <g transform="translate(400, 220)">
      <circle cx="0" cy="0" r="48" fill="#1B1924" stroke="#D7AE55" stroke-width="2" />
      <path d="M-14 -10 C-14 -20, 0 -26, 0 -34 C0 -26, 14 -20, 14 -10 C14 8, -14 8, -14 -10 Z" fill="#D7AE55" />
      <path d="M-8 -6 C-8 -14, 0 -18, 0 -22 C0 -18, 8 -14, 8 -6 C8 4, -8 4, -8 -6 Z" fill="#F7EBD2" />
      <path d="M-22 14 Q0 24 22 14" stroke="#D7AE55" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>

    <!-- Typography -->
    <text x="400" y="320" font-family="'Cormorant Garamond', Georgia, serif" font-size="34" font-weight="bold" fill="#F7EBD2" text-anchor="middle" letter-spacing="1">
      ${safeName}
    </text>
    <text x="400" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#D7AE55" text-anchor="middle" letter-spacing="4">
      ${safeCategory.toUpperCase()} • KARACHI BITES
    </text>
    <text x="400" y="400" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#8C8479" text-anchor="middle" letter-spacing="1.5">
      FRESH CULINARY HERITAGE
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Universal resolver to get the best available working image URL:
 * 1. Checks item ID in imported Vite assets
 * 2. Matches filename to imported Vite assets
 * 3. Fallbacks to root-relative public asset path (/images/...)
 */
export function resolveItemImage(imagePath?: string | null, itemId?: number): string {
  if (itemId && MENU_ITEM_IMAGES[itemId]) {
    return MENU_ITEM_IMAGES[itemId];
  }

  if (!imagePath) {
    return getFoodPlaceholderSvg('Karachi Bites Dish');
  }

  // Preserve external absolute HTTP URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Extract the filename from whatever path was provided
  const filename = imagePath.split('/').pop() || '';
  if (filename && ASSET_IMAGES_BY_FILENAME[filename]) {
    return ASSET_IMAGES_BY_FILENAME[filename];
  }

  // If already root-relative to public directory, return as-is
  if (imagePath.startsWith('/images/')) {
    return imagePath;
  }

  // Normalize /src/assets/images/... to /images/...
  if (imagePath.includes('/assets/images/')) {
    return `/images/${filename}`;
  }

  return imagePath;
}
