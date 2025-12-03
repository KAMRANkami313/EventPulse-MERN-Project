import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  // --- Original Languages ---
  en: {
    translation: {
      "welcome": "Welcome",
      "create_event": "Create Event",
      "logout": "Logout"
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido",
      "create_event": "Crear Evento",
      "logout": "Cerrar Sesión"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue",
      "create_event": "Créer un Événement",
      "logout": "Déconnexion"
    }
  },
  
  // --- New Languages ---
  tr: {
    translation: {
      "welcome": "Hoş Geldiniz",
      "create_event": "Etkinlik Oluştur",
      "logout": "Çıkış Yap"
    }
  },
  ur: { // Note: Urdu is a Right-to-Left (RTL) language. We will handle the direction later if needed.
    translation: {
      "welcome": "خوش آمدید",
      "create_event": "ایونٹ بنائیں",
      "logout": "لاگ آؤٹ"
    }
  },
  ar: { // Note: Arabic is also a Right-to-Left (RTL) language.
    translation: {
      "welcome": "مرحباً",
      "create_event": "إنشاء حدث",
      "logout": "تسجيل الخروج"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    interpolation: {
      escapeValue: false 
    },
    // Required for proper handling of RTL languages like Urdu and Arabic
    // We explicitly list the RTL languages here
    // Supported languages are automatically inferred from the resources object
    supportedLngs: ['en', 'es', 'fr', 'tr', 'ur', 'ar'], 
  });

export default i18n;