export interface CardTheme {
  id: string;
  name: string;
  emoji: string;
  vibe: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  fontHeading: string;
  fontBody: string;
  shadow: string;
  pattern?: 'dots' | 'grid' | 'noise' | 'mesh' | 'none';
}

export const themes: CardTheme[] = [
  {
    id: 'aurora', name: 'Aurora', emoji: '🌌', vibe: 'Dreamy violet haze',
    background: 'linear-gradient(135deg, #2d1b69 0%, #6e3ec1 50%, #ff6ec7 100%)',
    cardBg: 'rgba(255, 255, 255, 0.08)', cardBorder: 'rgba(255, 255, 255, 0.18)',
    accent: '#ffd6f5', accentSoft: 'rgba(255, 214, 245, 0.2)',
    text: '#ffffff', textMuted: 'rgba(255, 255, 255, 0.7)',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(110, 62, 193, 0.5)', pattern: 'mesh',
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', vibe: 'Warm tropical glow',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    cardBg: 'rgba(255, 255, 255, 0.15)', cardBorder: 'rgba(255, 255, 255, 0.3)',
    accent: '#ffffff', accentSoft: 'rgba(255, 255, 255, 0.25)',
    text: '#ffffff', textMuted: 'rgba(255, 255, 255, 0.85)',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(255, 107, 107, 0.5)', pattern: 'mesh',
  },
  {
    id: 'ocean', name: 'Ocean', emoji: '🌊', vibe: 'Deep blue calm',
    background: 'linear-gradient(135deg, #0093e9 0%, #80d0c7 100%)',
    cardBg: 'rgba(255, 255, 255, 0.12)', cardBorder: 'rgba(255, 255, 255, 0.25)',
    accent: '#ffffff', accentSoft: 'rgba(255, 255, 255, 0.2)',
    text: '#ffffff', textMuted: 'rgba(255, 255, 255, 0.8)',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(0, 147, 233, 0.5)', pattern: 'mesh',
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌿', vibe: 'Lush emerald nature',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    cardBg: 'rgba(255, 255, 255, 0.13)', cardBorder: 'rgba(255, 255, 255, 0.25)',
    accent: '#ffffff', accentSoft: 'rgba(255, 255, 255, 0.2)',
    text: '#ffffff', textMuted: 'rgba(255, 255, 255, 0.8)',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(17, 153, 142, 0.5)', pattern: 'mesh',
  },
  {
    id: 'cyberpunk', name: 'Cyberpunk', emoji: '⚡', vibe: 'Neon city nights',
    background: 'radial-gradient(circle at 30% 20%, #ff006e 0%, transparent 50%), radial-gradient(circle at 80% 80%, #00f5ff 0%, transparent 50%), #0a0014',
    cardBg: 'rgba(20, 10, 30, 0.7)', cardBorder: '#00f5ff',
    accent: '#00f5ff', accentSoft: 'rgba(0, 245, 255, 0.15)',
    text: '#ffffff', textMuted: '#ff006e',
    fontHeading: 'Space Grotesk', fontBody: 'Space Grotesk',
    shadow: '0 0 40px rgba(0, 245, 255, 0.4), 0 0 80px rgba(255, 0, 110, 0.2)',
    pattern: 'grid',
  },
  {
    id: 'peach', name: 'Peach', emoji: '🍑', vibe: 'Soft pastel cream',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    cardBg: 'rgba(255, 255, 255, 0.55)', cardBorder: 'rgba(255, 255, 255, 0.7)',
    accent: '#e76f51', accentSoft: 'rgba(231, 111, 81, 0.15)',
    text: '#3d2817', textMuted: '#8b5a3c',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(231, 111, 81, 0.3)', pattern: 'dots',
  },
  {
    id: 'bubblegum', name: 'Bubblegum', emoji: '🍬', vibe: 'Playful candy pop',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)',
    cardBg: 'rgba(255, 255, 255, 0.6)', cardBorder: 'rgba(255, 255, 255, 0.8)',
    accent: '#d6336c', accentSoft: 'rgba(214, 51, 108, 0.12)',
    text: '#5b1239', textMuted: '#a04068',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(214, 51, 108, 0.35)', pattern: 'dots',
  },
  {
    id: 'midnight', name: 'Midnight Gold', emoji: '✨', vibe: 'Classic luxury',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1530 100%)',
    cardBg: 'rgba(20, 16, 35, 0.8)', cardBorder: 'rgba(201, 168, 76, 0.4)',
    accent: '#d4af37', accentSoft: 'rgba(212, 175, 55, 0.15)',
    text: '#f0ead6', textMuted: '#a39880',
    fontHeading: 'Cormorant Garamond', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(212, 175, 55, 0.25)', pattern: 'noise',
  },
  {
    id: 'mono', name: 'Mono', emoji: '◾', vibe: 'Editorial minimal',
    background: '#fafaf9',
    cardBg: '#ffffff', cardBorder: '#1a1a1a',
    accent: '#1a1a1a', accentSoft: 'rgba(26, 26, 26, 0.08)',
    text: '#1a1a1a', textMuted: '#737373',
    fontHeading: 'Cormorant Garamond', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(0, 0, 0, 0.15)', pattern: 'none',
  },
  {
    id: 'lava', name: 'Lava', emoji: '🔥', vibe: 'Bold fiery energy',
    background: 'linear-gradient(135deg, #1a0000 0%, #cc0000 50%, #ff6b00 100%)',
    cardBg: 'rgba(0, 0, 0, 0.4)', cardBorder: 'rgba(255, 107, 0, 0.6)',
    accent: '#ffaa44', accentSoft: 'rgba(255, 170, 68, 0.15)',
    text: '#fff5e6', textMuted: 'rgba(255, 245, 230, 0.7)',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(255, 107, 0, 0.5)', pattern: 'noise',
  },
  {
    id: 'lavender', name: 'Lavender', emoji: '💜', vibe: 'Gentle dawn',
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    cardBg: 'rgba(255, 255, 255, 0.55)', cardBorder: 'rgba(255, 255, 255, 0.75)',
    accent: '#6d28d9', accentSoft: 'rgba(109, 40, 217, 0.12)',
    text: '#2e1065', textMuted: '#6d4aaa',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(109, 40, 217, 0.3)', pattern: 'dots',
  },
  {
    id: 'mint', name: 'Mint', emoji: '🌱', vibe: 'Fresh and crisp',
    background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    cardBg: 'rgba(255, 255, 255, 0.55)', cardBorder: 'rgba(255, 255, 255, 0.7)',
    accent: '#0a8754', accentSoft: 'rgba(10, 135, 84, 0.12)',
    text: '#0d3924', textMuted: '#3a6d50',
    fontHeading: 'Outfit', fontBody: 'Inter',
    shadow: '0 25px 60px -10px rgba(10, 135, 84, 0.3)', pattern: 'dots',
  },
];

export const getTheme = (id?: string): CardTheme => themes.find(t => t.id === id) || themes[0];
