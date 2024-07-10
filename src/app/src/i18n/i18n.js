import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 初始化i18next
i18n
  .use(Backend) // 加载语言文件的插件
  .use(LanguageDetector) // 自动检测用户语言的插件
  .use(initReactI18next) // React绑定
  .init({
    fallbackLng: 'en', // 当用户语言不可用时的默认语言
    debug: false, // 开启调试模式
    interpolation: {
      escapeValue: false, // React已经做了防注入处理
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 语言文件路径
    },
  });

export default i18n;
