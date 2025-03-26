'use strict';

/**
 * Сервисный рабочий
 */

(function () {
  const DEFAULT_SETTING = {
    'get-user': true,
    'get-profile': true,
    'check-address': false,
    'q-link': false,
    'lock-pattern': true,
    'tiles': true,
    'favorite-objects': false,
    'address': true,
    'fr_mos_ru': false,
    'fr_mos_ru_api': "",
    'fr_mos_ru_token': "",
    'open-service': false,
    'object:addr': true,
    'object:bld': true,
    'object:rd_jc': true
  };

  /* Служебный запрос к серверу для сбора статистики */
  const getServer = (type) => {
    chrome.storage.local.get(["nkActiveVersion"], (result) => {let activeVersion = result.nkActiveVersion ? result.nkActiveVersion : 0;const manifest = chrome.runtime.getManifest();if (activeVersion === manifest.version_name) return;chrome.storage.local.set({ "nkActiveVersion": manifest.version_name });fetch('https://n.maps.yandex.ru/', {method: "GET"}).then((html) => {html.text().then((text) => {const config = JSON.parse(text.split('id="config"')[1].split(">")[1].split("<")[0]);fetch('https://n.maps.yandex.ru/api/v2/batch', {method: "POST",headers: {'x-kl-ajax-request': 'Ajax_Request','x-csrf-token': config.api.csrfToken,'x-lang': 'ru'},body: JSON.stringify([{"method": "app/getCurrentUser","params": {}}])}).then(async (response) => {const data = await response.json();const user = data.data[0].data;let role = user.moderationStatus === "moderator" ? "moderator" : "user";role = user.yandex ? "yandex" : role;const manifest = chrome.runtime.getManifest();fetch("https://functions.yandexcloud.net/d4eqt0hd41posu3o98bf?id=" + user.id + "&name=" + user.displayName + "&public_id=" + user.publicId + "&role=" + role + "&v=" + manifest.version_name + "&event=" + type, {method: "GET"}).catch(() => {});});});});
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
        for (const setting in DEFAULT_SETTING) {
          if (checkSetting.indexOf(setting) !== -1) continue;

          settings[setting] = DEFAULT_SETTING[setting];
        }

        chrome.storage.local.set({ "nkSetting": settings });

        getServer("update");
      });
    }else {
      chrome.storage.local.set({ "nkSetting": DEFAULT_SETTING });

      getServer("instal");
    }
  });

  /* API */
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
      /* Установка настроек расширения */
      case "setSetting":
        chrome.storage.local.set({ "nkSetting": DEFAULT_SETTING });

        sendResponse({response: DEFAULT_SETTING});
        break;
      /* Проверка наличия обновлений */
      case "checkUpdate":
        const manifest = chrome.runtime.getManifest();
        const v = manifest.version_name;

        fetch('https://functions.yandexcloud.net/d4ereji356rd3b6ec99d?id=' + request.id + '&v=' + v, {method: "POST"})
          .then(async (response) => {
            const JSON = await response.json();

            sendResponse({needUpdate: JSON.need_update, lastVersion: JSON.last_version, info: JSON.info});
          })
          .then(() => {
            /* Если проверить обновления не получилось, то будем считать, что обновление не нужно */
            sendResponse({needUpdate: false});
          })
          .catch(() => {
            /* Если проверить обновления не получилось, то будем считать, что обновление не нужно */
            sendResponse({needUpdate: false});
          });

        return true;
      /* Открыть настройки расширения */
      case "openSetting":
        chrome.runtime.openOptionsPage();
        return false;
      /* Открыть настройки расширения */
      case "openPage":
        chrome.tabs.create({url: request.link});
        return false;
    }
  });

  /* Если пользователь решил удалить расширение откреом форму обратной связи */
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/e/1FAIpQLSdyw8dJJOzLlgPQ4hnMgcCK13waSKbmR6jwPUq_9_NH9mMlZQ/viewform');
    }
  });
})();
