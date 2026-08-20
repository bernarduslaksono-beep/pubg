export const PACKAGES = [
  {
    tierKey: 'kiik',
    items: [
      { uc: 325, price: 5 }, { uc: 385, price: 6 }, { uc: 445, price: 7 }, { uc: 505, price: 8 },
      { uc: 660, price: 10 }, { uc: 780, price: 12 }, { uc: 985, price: 15 }, { uc: 1045, price: 16 },
      { uc: 1320, price: 20 }, { uc: 1645, price: 26 },
    ],
  },
  {
    tierKey: 'medium',
    items: [
      { uc: 1860, price: 27 }, { uc: 2125, price: 31 }, { uc: 2520, price: 37 }, { uc: 2845, price: 44 },
      { uc: 3850, price: 52 }, { uc: 4510, price: 63 }, { uc: 5650, price: 79 }, { uc: 6035, price: 84 },
      { uc: 8160, price: 105 }, { uc: 9085, price: 120 },
    ],
  },
  {
    tierKey: 'boot',
    items: [
      { uc: 10225, price: 135 }, { uc: 12010, price: 160 }, { uc: 14075, price: 185 }, { uc: 17520, price: 225 },
    ],
  },
];

export const PAYMENT_METHODS = [
  {
    id: "bank_bnctl",
    typeKey: "type_bank_transfer",
    brand: "Bank BNCTL",
    number: "02600522989888",
    holder: "Bernardus Rano Laksono",
  },
  {
    id: "ewallet_mosan",
    typeKey: "type_ewallet",
    brand: "MOSAN",
    number: "76463746",
    holder: "Bernardus Rano Laksono",
  },
];

// Naran metode pagamentu ne'ebe guarda iha database — fixu iha Tetum (la muda
// tuir lian ne'ebe cliente hili), tanba dashboard admin de'it uza Tetum.
export const PAYMENT_METHOD_STORAGE_LABEL = {
  bank_bnctl: "Transferénsia — Bank BNCTL",
  ewallet_mosan: "E-Wallet — MOSAN",
};

// Status labels ba dashboard admin (Tetum de'it — haree src/i18n/translations.js
// ba versaun ne'ebe cliente haree iha pajina públiku, ne'ebe muda tuir lian hili).
export const STATUS_LABELS = {
  menunggu_verifikasi: "Hein Verifikasaun",
  terverifikasi: "Verifikadu",
  terkirim: "UC Haruka Ona",
  dibatalkan: "Kanseladu",
};

export const WHATSAPP_NUMBER = "76463746";
