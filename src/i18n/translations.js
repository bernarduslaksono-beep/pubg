export const LANGUAGES = [
  { code: 'tet', label: 'Tet' },
  { code: 'en', label: 'Eng' },
  { code: 'id', label: 'Ind' },
]

export const DEFAULT_LANGUAGE = 'tet'

export const TRANSLATIONS = {
  tet: {
    nav_order: "Pesan UC",
    nav_track: "Cek Status",
    footer_text: "Top Up UC PUBG · Dili, Timor-Leste",

    hero_title: "Top up UC PUBG",
    step1: "Hili pakote UC",
    step2: "Halo transferénsia",
    step3: "Upload prova transferénsia",
    step4: "Kria pedidu",
    hero_desc: "Ami sei verifika no haruka UC ba game ID ita boot nian (Prosesu ±15 menit).",
    whatsapp_confirm: "WhatsApp Konfirmasaun",

    step_indicator_pick: "Hili Pakote",
    step_indicator_pay: "Pagamentu",

    shop_avail: "Disponivel ba Timor-Leste",
    select_product_label: "Hili Produtu",
    pkg_count_suffix: "pakote",

    tier_kiik: "Pakote Ki'ik",
    tier_medium: "Pakote Medium",
    tier_boot: "Pakote Bo'ot",

    checkout_process_time: "Prosesu haruka: ±15 menit",

    selected_pkg_label: "Pakote hili",
    price_per_unit_label: "Osan / unidade",
    select_pkg_empty: "Hili pakote UC",

    user_id_label: "User ID",
    user_id_placeholder: "Ejemplu: 1234567891234567",
    nickname_label: "Nickname PUBG Mobile",
    nickname_placeholder: "Ejemplu: ucpubgtl2026",
    quantity_label: "Kuantidade",
    fullname_label: "Naran completu",
    fullname_placeholder: "Naran ita boot",
    whatsapp_label: "Numeru WhatsApp",
    whatsapp_placeholder: "7XXXXXXX",
    add_note_btn: "+ Hatama nota ba seller",
    note_label: "Nota ba seller",
    note_placeholder: "Informasaun adisional",

    total_uc_label: "Total UC",
    subtotal_label: "Subtotal",
    buy_btn: "Sosa",

    payment_method_title: "Metode Pagamentu",
    type_bank_transfer: "Transferénsia",
    type_ewallet: "E-Wallet",

    upload_title: "Upload Prova Transferénsia",
    upload_hint: "Transfere osan ba ami nia konta, depois upload prova transferénsia iha ne'e.",
    upload_main: "Upload prova transferénsia",
    upload_sub: "PNG ka JPG, até 5MB",
    upload_btn: "Hili Imajen",
    upload_file_ok: "Imajen ona hili",
    upload_change_btn: "Troka imajen",

    order_info_title: "Informasaun Pedido",
    edit_link: "Edit",

    payment_details_title: "Detalhus Pagamentu",
    total_order_label: "Total Pedidu",
    total_payment_label: "Total Pagamentu",

    submit_btn: "Haruka Pedidu",
    submitting_label: "Haruka...",
    submit_error: "Falha atu haruka pedidu. Favor tenta fila fali.",

    success_title: "Pedidu Submete!",
    success_desc: (wa) => `Ami sei verifika pagamentu no haruka UC ba game ID ita boot. Guarda Order ID ne'e atu cek status, no konfirma liu husi WhatsApp ${wa}.`,
    copy_btn: "Copy",
    copied_btn: "Tersalin",
    ok_btn: "Diak",

    track_eyebrow: "Status Pedidu",
    track_title_line1: "Cek progress",
    track_title_line2: "UC ita boot nian.",
    track_desc: "Hatama Order ID, numeru WhatsApp, ka rua-rua atu buka pedidu ita boot. Uza rua-rua atu buka espesifiku liu.",
    order_id_label: "Order ID",
    optional_label: "(opsional)",
    track_btn: "Cek Status",
    track_loading: "Buka...",
    track_empty_input: "Favor hatama Order ID ka numeru WhatsApp (ida ka rua-rua).",
    track_not_found: "Pedidu la hetan. Verifika Order ID ka numeru WhatsApp.",
    track_error: "Falha atu buka pedidu. Favor tenta fila fali.",

    pkg_row_label: "Pakote UC",
    price_row_label: "Osan",
    game_id_row_label: "Game ID",
    pubg_name_row_label: "Naran PUBG",
    date_row_label: "Data",
    seller_note_label: "Nota husi seller",

    status: {
      menunggu_verifikasi: "Hein Verifikasaun",
      terverifikasi: "Verifikadu",
      terkirim: "UC Haruka Ona",
      dibatalkan: "Kanseladu",
    },
  },

  en: {
    nav_order: "Order UC",
    nav_track: "Check Status",
    footer_text: "Top Up UC PUBG · Dili, Timor-Leste",

    hero_title: "Top up UC PUBG",
    step1: "Choose a UC package",
    step2: "Make the transfer",
    step3: "Upload proof of transfer",
    step4: "Submit the order",
    hero_desc: "We'll verify payment and send UC to your game ID (Processing time ±15 minutes).",
    whatsapp_confirm: "WhatsApp Confirmation",

    step_indicator_pick: "Choose Package",
    step_indicator_pay: "Payment",

    shop_avail: "Available in Timor-Leste",
    select_product_label: "Select Product",
    pkg_count_suffix: "packages",

    tier_kiik: "Small Packages",
    tier_medium: "Medium Packages",
    tier_boot: "Large Packages",

    checkout_process_time: "Delivery time: ±15 minutes",

    selected_pkg_label: "Selected package",
    price_per_unit_label: "Price / unit",
    select_pkg_empty: "Choose a UC package",

    user_id_label: "User ID",
    user_id_placeholder: "Example: 1234567891234567",
    nickname_label: "Nickname PUBG Mobile",
    nickname_placeholder: "Example: ucpubgtl2026",
    quantity_label: "Quantity",
    fullname_label: "Full name",
    fullname_placeholder: "Your name",
    whatsapp_label: "WhatsApp number",
    whatsapp_placeholder: "7XXXXXXX",
    add_note_btn: "+ Add a note for the seller",
    note_label: "Note for seller",
    note_placeholder: "Additional information",

    total_uc_label: "Total UC",
    subtotal_label: "Subtotal",
    buy_btn: "Buy",

    payment_method_title: "Payment Method",
    type_bank_transfer: "Bank Transfer",
    type_ewallet: "E-Wallet",

    upload_title: "Upload Proof of Transfer",
    upload_hint: "Transfer the payment to our account, then upload proof of transfer here.",
    upload_main: "Upload proof of transfer",
    upload_sub: "PNG or JPG, up to 5MB",
    upload_btn: "Choose Image",
    upload_file_ok: "Image selected",
    upload_change_btn: "Change image",

    order_info_title: "Order Information",
    edit_link: "Edit",

    payment_details_title: "Payment Details",
    total_order_label: "Order Total",
    total_payment_label: "Total Payment",

    submit_btn: "Submit Order",
    submitting_label: "Submitting...",
    submit_error: "Failed to submit order. Please try again.",

    success_title: "Order Submitted!",
    success_desc: (wa) => `We'll verify your payment and send UC to your game ID. Save this Order ID to check status, and confirm via WhatsApp ${wa}.`,
    copy_btn: "Copy",
    copied_btn: "Copied",
    ok_btn: "OK",

    track_eyebrow: "Order Status",
    track_title_line1: "Check the progress",
    track_title_line2: "of your UC.",
    track_desc: "Enter the Order ID, WhatsApp number, or both to find your order. Using both narrows the search.",
    order_id_label: "Order ID",
    optional_label: "(optional)",
    track_btn: "Check Status",
    track_loading: "Loading...",
    track_empty_input: "Please enter an Order ID or WhatsApp number (either or both).",
    track_not_found: "Order not found. Check the Order ID or WhatsApp number.",
    track_error: "Failed to load order. Please try again.",

    pkg_row_label: "UC Package",
    price_row_label: "Price",
    game_id_row_label: "Game ID",
    pubg_name_row_label: "PUBG Name",
    date_row_label: "Date",
    seller_note_label: "Note from seller",

    status: {
      menunggu_verifikasi: "Awaiting Verification",
      terverifikasi: "Verified",
      terkirim: "UC Delivered",
      dibatalkan: "Cancelled",
    },
  },

  id: {
    nav_order: "Pesan UC",
    nav_track: "Cek Status",
    footer_text: "Top Up UC PUBG · Dili, Timor-Leste",

    hero_title: "Top up UC PUBG",
    step1: "Pilih paket UC",
    step2: "Lakukan transfer",
    step3: "Upload bukti transfer",
    step4: "Buat pesanan",
    hero_desc: "Kami akan verifikasi pembayaran dan kirim UC ke game ID Anda (Proses ±15 menit).",
    whatsapp_confirm: "Konfirmasi WhatsApp",

    step_indicator_pick: "Pilih Paket",
    step_indicator_pay: "Pembayaran",

    shop_avail: "Tersedia di Timor-Leste",
    select_product_label: "Pilih Produk",
    pkg_count_suffix: "paket",

    tier_kiik: "Paket Kecil",
    tier_medium: "Paket Menengah",
    tier_boot: "Paket Besar",

    checkout_process_time: "Waktu proses: ±15 menit",

    selected_pkg_label: "Paket dipilih",
    price_per_unit_label: "Harga / unit",
    select_pkg_empty: "Pilih paket UC",

    user_id_label: "User ID",
    user_id_placeholder: "Contoh: 1234567891234567",
    nickname_label: "Nickname PUBG Mobile",
    nickname_placeholder: "Contoh: ucpubgtl2026",
    quantity_label: "Kuantitas",
    fullname_label: "Nama lengkap",
    fullname_placeholder: "Nama Anda",
    whatsapp_label: "Nomor WhatsApp",
    whatsapp_placeholder: "7XXXXXXX",
    add_note_btn: "+ Tambah catatan untuk penjual",
    note_label: "Catatan untuk penjual",
    note_placeholder: "Informasi tambahan",

    total_uc_label: "Total UC",
    subtotal_label: "Subtotal",
    buy_btn: "Beli",

    payment_method_title: "Metode Pembayaran",
    type_bank_transfer: "Transfer Bank",
    type_ewallet: "E-Wallet",

    upload_title: "Upload Bukti Transfer",
    upload_hint: "Transfer pembayaran ke rekening kami, lalu upload bukti transfer di sini.",
    upload_main: "Upload bukti transfer",
    upload_sub: "PNG atau JPG, maks 5MB",
    upload_btn: "Pilih Gambar",
    upload_file_ok: "Gambar telah dipilih",
    upload_change_btn: "Ganti gambar",

    order_info_title: "Informasi Pesanan",
    edit_link: "Edit",

    payment_details_title: "Detail Pembayaran",
    total_order_label: "Total Pesanan",
    total_payment_label: "Total Pembayaran",

    submit_btn: "Kirim Pesanan",
    submitting_label: "Mengirim...",
    submit_error: "Gagal mengirim pesanan. Silakan coba lagi.",

    success_title: "Pesanan Terkirim!",
    success_desc: (wa) => `Kami akan verifikasi pembayaran dan kirim UC ke game ID Anda. Simpan Order ID ini untuk cek status, dan konfirmasi lewat WhatsApp ${wa}.`,
    copy_btn: "Salin",
    copied_btn: "Tersalin",
    ok_btn: "Oke",

    track_eyebrow: "Status Pesanan",
    track_title_line1: "Cek progress",
    track_title_line2: "UC Anda.",
    track_desc: "Masukkan Order ID, nomor WhatsApp, atau keduanya untuk mencari pesanan Anda. Gunakan keduanya untuk pencarian lebih spesifik.",
    order_id_label: "Order ID",
    optional_label: "(opsional)",
    track_btn: "Cek Status",
    track_loading: "Memuat...",
    track_empty_input: "Silakan masukkan Order ID atau nomor WhatsApp (salah satu atau keduanya).",
    track_not_found: "Pesanan tidak ditemukan. Periksa Order ID atau nomor WhatsApp.",
    track_error: "Gagal memuat pesanan. Silakan coba lagi.",

    pkg_row_label: "Paket UC",
    price_row_label: "Harga",
    game_id_row_label: "Game ID",
    pubg_name_row_label: "Nama PUBG",
    date_row_label: "Tanggal",
    seller_note_label: "Catatan dari penjual",

    status: {
      menunggu_verifikasi: "Menunggu Verifikasi",
      terverifikasi: "Terverifikasi",
      terkirim: "UC Terkirim",
      dibatalkan: "Dibatalkan",
    },
  },
}
