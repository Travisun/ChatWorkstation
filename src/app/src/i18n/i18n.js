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
      loadPath: (languages, namespaces) => {
        const primaryLng = languages[0];
        // 定义备用路径数组
        const alternativeLngs = [primaryLng.split('-')[0]];
        const paths = [
          `locales/${primaryLng}/${namespaces[0]}.json`,
          ...alternativeLngs.map(altLng => `locales/${altLng}/${namespaces[0]}.json`)
        ];
        return paths;
      },
    },
    detection: {
      // 语言检测器的配置
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
