import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';

// https://github.com/isaachinman/next-i18next/issues/562
// the values in this array should match the language codes of the json files inside the i18n folder
i18next.languages = [
  'en',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'nl',
  'pt_br',
  'ru',
  'zh_cn',
  'zh_tw'
];

export default state => {
  const options = {
    fallbackLng: 'en',
    react: {
      useSuspense: false,
      wait: true,
    },
  };
  const callback = (err, t) => {
    window.Annotations.Utilities.setAnnotationSubjectHandler(type =>
      t(`annotation.${type}`),
    );

    window.Tools.SignatureCreateTool.setTextHandler(() =>
      t('message.signHere'),
    );

    window.Tools.FreeTextCreateTool.setTextHandler(() =>
      t('message.insertTextHere'),
    );

    window.Tools.CalloutCreateTool.setTextHandler(() =>
      t('message.insertTextHere'),
    );
  };

  if (state.advanced.disableI18n) {
    i18next.init(options, callback);
  } else {
    i18next.use(XHR).init(
      {
        ...options,
        backend: {
          loadPath: './i18n/{{ns}}-{{lng}}.json',
        },
      },
      callback,
    );
  }
};
