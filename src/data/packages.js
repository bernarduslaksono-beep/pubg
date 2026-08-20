export const PACKAGES = [
  {
    tier: "Pakote Ki'ik",
    items: [
      { uc: 325, price: 6 }, { uc: 385, price: 7 }, { uc: 445, price: 8 }, { uc: 505, price: 9 },
      { uc: 660, price: 11 }, { uc: 780, price: 13 }, { uc: 985, price: 16 }, { uc: 1045, price: 17 },
      { uc: 1320, price: 22 }, { uc: 1645, price: 27 },
    ],
  },
  {
    tier: "Pakote Medium",
    items: [
      { uc: 1860, price: 28 }, { uc: 2125, price: 35 }, { uc: 2520, price: 40 }, { uc: 2845, price: 47 },
      { uc: 3850, price: 55 }, { uc: 4510, price: 66 }, { uc: 5650, price: 83 }, { uc: 6035, price: 89 },
      { uc: 8160, price: 110 }, { uc: 9085, price: 125 },
    ],
  },
  {
    tier: "Pakote Bo'ot",
    items: [
      { uc: 10225, price: 140 }, { uc: 12010, price: 165 }, { uc: 14075, price: 195 }, { uc: 17520, price: 235 },
    ],
  },
];

export const PAYMENT_METHODS = [
  {
    id: "bank_bnctl",
    name: "Transferénsia — Bank BNCTL",
    number: "02600522989888",
    holder: "Bernardus Rano Laksono",
  },
  {
    id: "ewallet_mosan",
    name: "E-Wallet — MOSAN",
    number: "76463746",
    holder: "Bernardus Rano Laksono",
  },
];

export const STATUS_LABELS = {
  menunggu_verifikasi: "Hein Verifikasaun",
  terverifikasi: "Verifikadu",
  terkirim: "UC Haruka Ona",
  dibatalkan: "Kanseladu",
};

export const WHATSAPP_NUMBER = "76463746";
