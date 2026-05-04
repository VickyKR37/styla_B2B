export type SeasonKey = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type Swatch = {
  name: string;
  hex: `#${string}`;
  note: string;
};

export type SeasonData = {
  tagline: string;
  wear: Swatch[];
  avoid: Swatch[];
};

// Ported from https://github.com/VickyKR37/colour_analysis/blob/main/script.js
export const SEASONS: Record<SeasonKey, SeasonData> = {
  Spring: {
    tagline: 'Warm, clear and light – fresh, bright tones bring you to life.',
    wear: [
      { name: 'Warm Coral', hex: '#ff7c6b', note: 'Lively and bright' },
      { name: 'Buttercream', hex: '#ffe8b3', note: 'Soft light neutral' },
      { name: 'Fresh Aqua', hex: '#4fd1c5', note: 'Clear, playful' },
      { name: 'Apple Green', hex: '#8fdc6c', note: 'Crisp and warm' },
      { name: 'Apricot', hex: '#ffb482', note: 'Glowing warmth' },
      { name: 'Warm Navy', hex: '#264477', note: 'Gentle contrast' },
    ],
    avoid: [
      { name: 'Dusty Mauve', hex: '#9b7597', note: 'Too muted/cool' },
      { name: 'Charcoal', hex: '#374151', note: 'Overpowers' },
      { name: 'Icy Pink', hex: '#f9d7ff', note: 'Too cool' },
      { name: 'Burgundy', hex: '#581c2b', note: 'Too heavy' },
      { name: 'Slate Blue', hex: '#64748b', note: 'Greyed down' },
      { name: 'Ash Brown', hex: '#4b5563', note: 'Drains warmth' },
    ],
  },
  Summer: {
    tagline: 'Cool, soft and romantic – muted pastels and refined tones suit you best.',
    wear: [
      { name: 'Rosewood', hex: '#c27c9b', note: 'Soft and cool' },
      { name: 'French Navy', hex: '#1c2f4a', note: 'Elegant neutral' },
      { name: 'Shell Pink', hex: '#f7c6d6', note: 'Gentle blush' },
      { name: 'Misty Blue', hex: '#9fb6d7', note: 'Powdery cool' },
      { name: 'Seafoam', hex: '#9ad1c4', note: 'Quiet freshness' },
      { name: 'Soft Plum', hex: '#8b6c94', note: 'Sophisticated depth' },
    ],
    avoid: [
      { name: 'Tomato Red', hex: '#f44336', note: 'Too hot' },
      { name: 'Golden Orange', hex: '#ff9800', note: 'Too warm' },
      { name: 'Sharp Lime', hex: '#d4f30b', note: 'Too acidic' },
      { name: 'Black', hex: '#000000', note: 'Harsh contrast' },
      { name: 'Neon Pink', hex: '#ff3fb4', note: 'Too intense' },
      { name: 'Warm Camel', hex: '#b58b58', note: 'Too yellow' },
    ],
  },
  Autumn: {
    tagline: 'Rich, warm and earthy – deep golden tones echo your natural warmth.',
    wear: [
      { name: 'Burnt Sienna', hex: '#c46a3d', note: 'Glowing warmth' },
      { name: 'Olive Green', hex: '#7a8b3a', note: 'Earthy neutral' },
      { name: 'Mustard', hex: '#d89c25', note: 'Golden highlight' },
      { name: 'Teal', hex: '#1c7a7f', note: 'Rich contrast' },
      { name: 'Terracotta', hex: '#cc5b3f', note: 'Soft depth' },
      { name: 'Chocolate Brown', hex: '#4b2e20', note: 'Grounding base' },
    ],
    avoid: [
      { name: 'Icy Blue', hex: '#c3e3ff', note: 'Too cool' },
      { name: 'Silver Grey', hex: '#e5e7eb', note: 'Washes out' },
      { name: 'Magenta', hex: '#d81b60', note: 'Too cool/clear' },
      { name: 'True Black', hex: '#000000', note: 'Too severe' },
      { name: 'Lilac', hex: '#d9c2ff', note: 'Too cool' },
      { name: 'Bubblegum Pink', hex: '#ff7bbf', note: 'Too sugary' },
    ],
  },
  Winter: {
    tagline: 'Cool, clear and dramatic – crisp, high-contrast hues mirror your intensity.',
    wear: [
      { name: 'True Black', hex: '#000000', note: 'Signature neutral' },
      { name: 'Optic White', hex: '#f9fafb', note: 'Clean contrast' },
      { name: 'Sapphire', hex: '#1749b3', note: 'Bold and cool' },
      { name: 'Fuchsia', hex: '#d4146b', note: 'Electric statement' },
      { name: 'Emerald', hex: '#007f5f', note: 'Striking jewel' },
      { name: 'Cherry Red', hex: '#c8102e', note: 'Clear cool red' },
    ],
    avoid: [
      { name: 'Camel', hex: '#c19a6b', note: 'Too warm' },
      { name: 'Rust', hex: '#b7410e', note: 'Too muted' },
      { name: 'Peach', hex: '#ffcda5', note: 'Too soft/warm' },
      { name: 'Olive', hex: '#7a8b3a', note: 'Drab on you' },
      { name: 'Warm Taupe', hex: '#b39b82', note: 'Muddy' },
      { name: 'Soft Coral', hex: '#ff8b7b', note: 'Too gentle' },
    ],
  },
};

