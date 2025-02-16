const messages = {
  en: {
    extensionName: "Mouse Gesture & Copy Protection Bypass",
    extensionDescription: "Navigate web pages with mouse gestures and bypass copy protection. Fast and lightweight extension.",
    copyProtectionToggle: "Copy Protection Bypass",
    searchPrefixPlaceholder: "Search Prefix",
    saveButton: "Save",
    searchWithPrefix: "Search \"%s\"",
    youtubeControlText: "YouTube Skip Time (seconds)",
    gestureBack: "Back",
    gestureForward: "Forward",
    initializationError: "Initialization error",
    saveError: "Save error",
    extensionContextError: "Extension context not found"
  },
  ko: {
    extensionName: "마우스 제스처 & 복사방지 해제",
    extensionDescription: "마우스 제스처로 웹 페이지를 앞뒤로 이동하고, 복사 방지된 사이트에서도 자유롭게 콘텐츠를 복사할 수 있는 크롬 확장프로그램입니다.",
    copyProtectionToggle: "복사 방지 해제",
    searchPrefixPlaceholder: "검색어 접두어",
    saveButton: "저장",
    searchWithPrefix: "\"%s\" 검색하기",
    youtubeControlText: "유튜브 스킵 시간(초)",
    gestureBack: "뒤로",
    gestureForward: "앞으로"
  },
  ja: {
    extensionName: "マウスジェスチャー & コピー保護解除",
    extensionDescription: "マウスジェスチャーでウェブページを移動し、コピー保護を解除します。軽量で高速な拡張機能です。",
    copyProtectionToggle: "コピー保護解除",
    searchPrefixPlaceholder: "検索プレフィックス",
    saveButton: "保存",
    searchWithPrefix: "\"%s\"を検索",
    youtubeControlText: "YouTubeスキップ時間(秒)",
    gestureBack: "戻る",
    gestureForward: "進む"
  },
  zh: {
    extensionName: "鼠标手势 & 复制保护解除",
    extensionDescription: "使用鼠标手势导航网页并解除复制保护。快速轻量的扩展程序。",
    copyProtectionToggle: "解除复制保护",
    searchPrefixPlaceholder: "搜索前缀",
    saveButton: "保存",
    searchWithPrefix: "搜索\"%s\"",
    youtubeControlText: "YouTube跳转时间(秒)",
    gestureBack: "后退",
    gestureForward: "前进"
  },
  zh_TW: {
    extensionName: "滑鼠手勢 & 複製保護解除",
    extensionDescription: "使用滑鼠手勢導航網頁並解除複製保護。快速輕量的擴充功能。",
    copyProtectionToggle: "解除複製保護",
    searchPrefixPlaceholder: "搜尋前綴",
    saveButton: "儲存",
    searchWithPrefix: "搜尋\"%s\"",
    youtubeControlText: "YouTube跳轉時間(秒)"
  },
  es: {
    extensionName: "Gestos del Ratón & Bypass de Protección de Copia",
    extensionDescription: "Navega por páginas web con gestos del ratón y evita la protección de copia. Extensión rápida y ligera.",
    copyProtectionToggle: "Bypass de Protección de Copia",
    searchPrefixPlaceholder: "Prefijo de Búsqueda",
    saveButton: "Guardar",
    searchWithPrefix: "Buscar \"%s\"",
    youtubeControlText: "Tiempo de salto de YouTube (segundos)"
  },
  fr: {
    extensionName: "Gestes de Souris & Contournement de Protection de Copie",
    extensionDescription: "Naviguez sur les pages web avec des gestes de souris et contournez la protection de copie. Extension rapide et légère.",
    copyProtectionToggle: "Contourner la Protection de Copie",
    searchPrefixPlaceholder: "Préfixe de Recherche",
    saveButton: "Enregistrer",
    searchWithPrefix: "Rechercher \"%s\"",
    youtubeControlText: "Temps de saut YouTube (secondes)"
  },
  de: {
    extensionName: "Mausgesten & Kopierschutz-Bypass",
    extensionDescription: "Navigieren Sie durch Webseiten mit Mausgesten und umgehen Sie den Kopierschutz. Schnelle und leichte Erweiterung.",
    copyProtectionToggle: "Kopierschutz-Bypass",
    searchPrefixPlaceholder: "Suchpräfix",
    saveButton: "Speichern",
    searchWithPrefix: "\"%s\" suchen",
    youtubeControlText: "YouTube Sprungzeit (Sekunden)"
  },
  it: {
    extensionName: "Gesti del Mouse & Bypass Protezione Copia",
    extensionDescription: "Naviga nelle pagine web con gesti del mouse e bypassa la protezione della copia. Estensione veloce e leggera.",
    copyProtectionToggle: "Bypass Protezione Copia",
    searchPrefixPlaceholder: "Prefisso di Ricerca",
    saveButton: "Salva",
    searchWithPrefix: "Cerca \"%s\"",
    youtubeControlText: "Tempo di salto YouTube (secondi)"
  },
  pt: {
    extensionName: "Gestos do Mouse & Bypass de Proteção de Cópia",
    extensionDescription: "Navegue em páginas web com gestos do mouse e ignore a proteção de cópia. Extensão rápida e leve.",
    copyProtectionToggle: "Bypass de Proteção de Cópia",
    searchPrefixPlaceholder: "Prefixo de Pesquisa",
    saveButton: "Salvar",
    searchWithPrefix: "Pesquisar \"%s\"",
    youtubeControlText: "Tempo de pulo do YouTube (segundos)"
  },
  ru: {
    extensionName: "Жесты Мыши & Обход Защиты от Копирования",
    extensionDescription: "Навигация по веб-страницам с помощью жестов мыши и обход защиты от копирования. Быстрое и легкое расширение.",
    copyProtectionToggle: "Обход Защиты от Копирования",
    searchPrefixPlaceholder: "Префикс Поиска",
    saveButton: "Сохранить",
    searchWithPrefix: "Искать \"%s\"",
    youtubeControlText: "Время пропуска YouTube (секунды)"
  },
  ar: {
    extensionName: "إيماءات الماوس وتجاوز حماية النسخ",
    extensionDescription: "تصفح صفحات الويب بإيماءات الماوس وتجاوز حماية النسخ. إضافة سريعة وخفيفة.",
    copyProtectionToggle: "تجاوز حماية النسخ",
    searchPrefixPlaceholder: "بادئة البحث",
    saveButton: "حفظ",
    searchWithPrefix: "بحث عن \"%s\"",
    youtubeControlText: "وقت التخطي في يوتيوب (ثواني)"
  },
  hi: {
    extensionName: "माउस जेस्चर और कॉपी प्रोटेक्शन बायपास",
    extensionDescription: "माउस जेस्चर से वेब पेज नेविगेट करें और कॉपी प्रोटेक्शन को बायपास करें। तेज और हल्का एक्सटेंशन।",
    copyProtectionToggle: "कॉपी प्रोटेक्शन बायपास",
    searchPrefixPlaceholder: "खोज उपसर्ग",
    saveButton: "सहेजें",
    searchWithPrefix: "\"%s\" खोजें",
    youtubeControlText: "यूट्यूब स्किप टाइम (सेकंड)"
  },
  vi: {
    extensionName: "Cử Chỉ Chuột & Bỏ Qua Bảo Vệ Sao Chép",
    extensionDescription: "Điều hướng trang web bằng cử chỉ chuột và bỏ qua bảo vệ sao chép. Tiện ích mở rộng nhanh và nhẹ.",
    copyProtectionToggle: "Bỏ Qua Bảo Vệ Sao Chép",
    searchPrefixPlaceholder: "Tiền Tố Tìm Kiếm",
    saveButton: "Lưu",
    searchWithPrefix: "Tìm kiếm \"%s\"",
    youtubeControlText: "Thời gian nhảy YouTube (giây)"
  },
  th: {
    extensionName: "ท่าทางเมาส์ & บายพาสการป้องกันการคัดลอก",
    extensionDescription: "นำทางหน้าเว็บด้วยท่าทางเมาส์และบายพาสการป้องกันการคัดลอก ส่วนขยายที่เร็วและเบา",
    copyProtectionToggle: "บายพาสการป้องกันการคัดลอก",
    searchPrefixPlaceholder: "คำนำหน้าการค้นหา",
    saveButton: "บันทึก",
    searchWithPrefix: "ค้นหา \"%s\"",
    youtubeControlText: "เวลาข้าม YouTube (วินาที)"
  },
  id: {
    extensionName: "Gestur Mouse & Bypass Proteksi Salin",
    extensionDescription: "Navigasi halaman web dengan gestur mouse dan bypass proteksi penyalinan. Ekstensi cepat dan ringan.",
    copyProtectionToggle: "Bypass Proteksi Salin",
    searchPrefixPlaceholder: "Awalan Pencarian",
    saveButton: "Simpan",
    searchWithPrefix: "Cari \"%s\"",
    youtubeControlText: "YouTube Skip Time (seconds)"
  },
  tr: {
    extensionName: "Fare Hareketleri & Kopya Koruması Bypass",
    extensionDescription: "Fare hareketleriyle web sayfalarında gezinin ve kopya korumasını atlayın. Hızlı ve hafif uzantı.",
    copyProtectionToggle: "Kopya Koruması Bypass",
    searchPrefixPlaceholder: "Arama Öneki",
    saveButton: "Kaydet",
    searchWithPrefix: "\"%s\" ara",
    youtubeControlText: "YouTube Skip Time (seconds)"
  },
  pl: {
    extensionName: "Gesty Myszy & Obejście Ochrony Kopiowania",
    extensionDescription: "Nawiguj po stronach za pomocą gestów myszy i obchodź ochronę przed kopiowaniem. Szybkie i lekkie rozszerzenie.",
    copyProtectionToggle: "Obejście Ochrony Kopiowania",
    searchPrefixPlaceholder: "Prefiks Wyszukiwania",
    saveButton: "Zapisz",
    searchWithPrefix: "Szukaj \"%s\"",
    youtubeControlText: "YouTube Skip Time (seconds)"
  },
  nl: {
    extensionName: "Muisgebaren & Kopieerbeveiliging Bypass",
    extensionDescription: "Navigeer door webpagina's met muisgebaren en omzeil kopieerbeveiliging. Snelle en lichte extensie.",
    copyProtectionToggle: "Kopieerbeveiliging Bypass",
    searchPrefixPlaceholder: "Zoekvoorvoegsel",
    saveButton: "Opslaan",
    searchWithPrefix: "Zoek \"%s\"",
    youtubeControlText: "YouTube Skip Time (seconds)"
  },
  cs: {
    extensionName: "Gesta Myši & Obejití Ochrany Kopírování",
    extensionDescription: "Procházejte webové stránky pomocí gest myši a obejděte ochranu proti kopírování. Rychlé a lehké rozšíření.",
    copyProtectionToggle: "Obejít Ochranu Kopírování",
    searchPrefixPlaceholder: "Prefix Vyhledávání",
    saveButton: "Uložit",
    searchWithPrefix: "Hledat \"%s\"",
    youtubeControlText: "YouTube Skip Time (seconds)"
  }
};

let currentLang = null;

export function getCurrentLanguage() {
  if (!currentLang) {
    currentLang = (navigator.language || navigator.userLanguage).split('-')[0];
    currentLang = messages[currentLang] ? currentLang : 'en';
  }
  return currentLang;
}

export function getMessage(key) {
  const lang = getCurrentLanguage();
  const texts = messages[lang] || messages.en;
  return texts[key] || messages.en[key];
}

export function getAllMessages() {
  const lang = getCurrentLanguage();
  return messages[lang] || messages.en;
}

export { messages };

// 브라우저 환경용
if (typeof window !== 'undefined') {
  window.messages = messages;
} 