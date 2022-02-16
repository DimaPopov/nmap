'use strict';

/**
 * Автоматические исправление проблем при обновлнеии
 */

(function () {
  const default_setting = {
    'get-user': true,
    'get-profile': true,
    'check-address': true,
    'notification': true,
    'q-link': false
  };

  /* Начинаем отслеживание обновлений или установки расширения */
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update") {
      let checkSetting = [];

      chrome.storage.local.get(["nkSetting"], (result) => {
        let settings = result.nkSetting;

        for (const setting in settings) {
          checkSetting.push(setting);
        }

        /* Проверим каких настроек нет и добавим их */
        for (const setting in default_setting) {
          if (checkSetting.indexOf(setting) !== -1) continue;

          settings[setting] = default_setting[setting];
        }

        chrome.storage.local.set({ "nkSetting": settings });
      });
    }else {
      chrome.storage.local.set({ "nkSetting": default_setting });
    }
  });
})();