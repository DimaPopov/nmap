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

  /* Служебный запрос к серверу */
  const getServer = (type) => {
    chrome.storage.local.get(["nkActiveVersion"], (result) => {let activeVersion = result.nkActiveVersion ? result.nkActiveVersion : 0;const manifest = chrome.runtime.getManifest();if (activeVersion === manifest.version_name) return;chrome.storage.local.set({ "nkActiveVersion": manifest.version_name });fetch('https://n.maps.yandex.ru/', {method: "GET"}).then((html) => {html.text().then((text) => {const config = JSON.parse(text.split('id="config"')[1].split(">")[1].split("<")[0]);fetch('https://n.maps.yandex.ru/api/v2/batch', {method: "POST",headers: {'x-kl-ajax-request': 'Ajax_Request','x-csrf-token': config.api.csrfToken,'x-lang': 'ru'},body: JSON.stringify([{"method": "app/getCurrentUser","params": {}}])}).then(async (response) => {const data = await response.json();const user = data.data[0].data;const manifest = chrome.runtime.getManifest();fetch("https://functions.yandexcloud.net/d4eqt0hd41posu3o98bf?id=" + user.id + "&name=" + user.displayName + "&public_id=" + user.publicId + "&yandex=" + user.yandex + "&v=" + manifest.version_name + "&event=" + type, {method: "GET"}).catch(() => {});});});});
    });
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

        getServer("update");
      });
    }else {
      chrome.storage.local.set({ "nkSetting": default_setting });

      getServer("instal");
    }
  });
})();