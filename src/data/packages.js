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
// Nota: "terkirim" la hatama unidade moeda (UC/Diamond) tanba label ida ne'e
// uza hamutuk ba hotu-hotu jogu (PUBG, ML, FF).
export const STATUS_LABELS = {
  menunggu_verifikasi: "Hein Verifikasaun",
  terverifikasi: "Verifikadu",
  terkirim: "Haruka Ona",
  dibatalkan: "Kanseladu",
};

export const WHATSAPP_NUMBER = "76463746";
