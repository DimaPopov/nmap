'use strict';

/**
 * Сервисный рабочий
 */

(function () {
  const default_setting = {
    'get-user': true,
    'get-profile': true,
    'check-address': false,
    'duplicate-addresses': true,
    'notification': true,
    'q-link': false,
    'lock-pattern': true,
    'tiles': true,
    'parking': true,
    'vegetation': true
  };

  /* Начинаем отслеживание обновлений или установки расширения */
  chrome.runtime.onInstalled.addListener((details) => {
    /**
     * Автоматические исправление проблем настроек при обновлении или установке
     */

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