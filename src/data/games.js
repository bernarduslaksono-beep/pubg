// Konfigurasaun sentral ba hotu-hotu jogu ne'ebe website ne'e fa'an.
// Kada jogu iha: naran, kor identidade, unidade moeda (UC/Diamond),
// bele/la bele presiza Zone ID, no lista pakote (organizadu iha 3 tier).

export const GAMES = {
  pubg: {
    key: 'pubg',
    name: 'PUBG Mobile',
    orderPrefix: 'OA',
    currencyLabel: 'UC',
    hasZoneId: false,
    accentColor: '#E7343F',
    accentColorDim: 'rgba(231,52,63,0.10)',
    tiers: [
      {
        tierKey: 'kiik',
        items: [
          { amount: 325, price: 5 }, { amount: 385, price: 6 }, { amount: 445, price: 7 }, { amount: 505, price: 8 },
          { amount: 660, price: 10 }, { amount: 780, price: 12 }, { amount: 985, price: 15 }, { amount: 1045, price: 16 },
          { amount: 1320, price: 20 }, { amount: 1645, price: 26 },
        ],
      },
      {
        tierKey: 'medium',
        items: [
          { amount: 1860, price: 27 }, { amount: 2125, price: 31 }, { amount: 2520, price: 37 }, { amount: 2845, price: 44 },
          { amount: 3850, price: 52 }, { amount: 4510, price: 63 }, { amount: 5650, price: 79 }, { amount: 6035, price: 84 },
          { amount: 8160, price: 105 }, { amount: 9085, price: 120 },
        ],
      },
      {
        tierKey: 'boot',
        items: [
          { amount: 10225, price: 135 }, { amount: 12010, price: 160 }, { amount: 14075, price: 185 }, { amount: 17520, price: 225 },
        ],
      },
    ],
  },

  ml: {
    key: 'ml',
    name: 'Mobile Legends',
    orderPrefix: 'ML',
    currencyLabel: 'Diamond',
    hasZoneId: true,
    accentColor: '#2563EB',
    accentColorDim: 'rgba(37,99,235,0.10)',
    tiers: [
      {
        tierKey: 'kiik',
        items: [
          { amount: 170, price: 5 }, { amount: 222, price: 6 }, { amount: 240, price: 7 }, { amount: 296, price: 8 },
        ],
      },
      {
        tierKey: 'medium',
        items: [
          { amount: 370, price: 10 }, { amount: 408, price: 11 }, { amount: 568, price: 13 }, { amount: 875, price: 19 },
        ],
      },
      {
        tierKey: 'boot',
        items: [
          { amount: 966, price: 21 }, { amount: 2010, price: 41 }, { amount: 4830, price: 98 },
        ],
      },
    ],
  },

  ff: {
    key: 'ff',
    name: 'Free Fire',
    orderPrefix: 'FF',
    currencyLabel: 'Diamond',
    hasZoneId: false,
    accentColor: '#F97316',
    accentColorDim: 'rgba(249,115,22,0.10)',
    tiers: [
      {
        tierKey: 'kiik',
        items: [
          { amount: 355, price: 5 }, { amount: 510, price: 6 }, { amount: 655, price: 7 },
          { amount: 720, price: 8 }, { amount: 925, price: 10 }, { amount: 1080, price: 12 },
        ],
      },
      {
        tierKey: 'medium',
        items: [
          { amount: 1200, price: 13 }, { amount: 1450, price: 16 }, { amount: 1800, price: 19 },
          { amount: 2000, price: 21 }, { amount: 2160, price: 23 }, { amount: 2400, price: 25 },
        ],
      },
      {
        tierKey: 'boot',
        items: [
          { amount: 3640, price: 37 }, { amount: 4000, price: 42 }, { amount: 4450, price: 46 },
          { amount: 7290, price: 71 }, { amount: 9800, price: 93 },
        ],
      },
    ],
  },
}

export function getGame(key) {
  return GAMES[key] || null
}
