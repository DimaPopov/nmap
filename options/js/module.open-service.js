'use strict';

/**
 * Скрипт управления модулем перехода на другие картографические сервисы
 */

(function () {
  let settingopenServices = {};

  chrome.storage.local.get(["nkSetting-openServices"], (result) => {
    if (!result["nkSetting-openServices"]) {
      const DEFAULT_SETTING = {
        'pkk': false,
        '2gis': true,
        'google': true,
        'osm': false,
        'here': false,
        'wikimapia': false,
        'setting-button': true,
        'setting-button-menu': false,
        'setting-menu': false
      };

      chrome.storage.local.set({"nkSetting-openServices": DEFAULT_SETTING});
      settingopenServices = DEFAULT_SETTING;
    } else {
      settingopenServices = result["nkSetting-openServices"];
    }

    for (const name in settingopenServices) {
      const value = settingopenServices[name];

      const id = "#" + name;
      const element = $(id);
      const checkboxContent = element.parent().parent();

      if (value) {
        element.attr("checked", true);
        checkboxContent.addClass("checkbox_checked_yes");
      }

      element.on("input", () => {
        settingopenServices[name] = !element.attr("checked");

        element.attr("checked", !element.attr("checked"));
        checkboxContent.toggleClass("checkbox_checked_yes");

        chrome.storage.local.set({ "nkSetting-openServices": settingopenServices });
      });
    }
  });
})();