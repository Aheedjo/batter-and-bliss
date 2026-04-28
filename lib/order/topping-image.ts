/**
 * Thumbnail URLs for menu add-ons (Unsplash). More specific keys first.
 */
const BY_KEYWORD: [string, string][] = [
  [
    "nutella",
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "oreo",
    "https://images.unsplash.com/photo-1614707267537-ab76c2d1f565?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "lotus",
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "marshmallow",
    "https://images.unsplash.com/photo-1558635928-14fc3ca4a522?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "twix",
    "https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "caramel",
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "kiwi",
    "https://images.unsplash.com/photo-1585059895524-723bacbde7d7?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "pistachio",
    "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "coconut",
    "https://images.unsplash.com/photo-1553530979-350cb83f691e?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "tiger",
    "https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "kunun",
    "https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "whip",
    "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "glaze",
    "https://images.unsplash.com/photo-1578985545062-69928b564d13?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "strawberr",
    "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "blueberr",
    "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "ganache",
    "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "sprinkle",
    "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "maple",
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "pecan",
    "https://images.unsplash.com/photo-1600189020840-e9918c7d6932?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "chocolate",
    "https://images.unsplash.com/photo-1511381939415-e44015466834?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "cream",
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "fusion",
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop&q=80&auto=format",
  ],
  [
    "milk",
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop&q=80&auto=format",
  ],
];

const FALLBACK =
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop&q=80&auto=format";

export function toppingImageUrl(name: string) {
  const n = name.toLowerCase();
  for (const [key, url] of BY_KEYWORD) {
    if (n.includes(key)) return url;
  }
  return FALLBACK;
}
