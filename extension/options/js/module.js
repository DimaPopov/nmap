'use strict';

/**
 * Скрипт для раздела модулей
 */

(function () {
  let settings = {};

  chrome.storage.local.get(["nkSetting"], (result) => {
    if (!result.nkSetting) {
      const default_setting = {
        'get-user': true,
        'get-profile': true,
        'check-address': true,
        'notification': true,
        'q-link': false
      };

      chrome.storage.local.set({ "nkSetting": default_setting });
      settings = default_setting;
    }else {
      settings = result.nkSetting;
    }

    for (const name in settings) {
      const value = settings[name];
      const checkbox = $("#" + name);
      if (!checkbox[0]) continue;

      const checkboxContent = checkbox.parent().parent();

      if (value) {
        checkbox.attr("checked", true);
        checkboxContent.addClass("checkbox_checked_yes");
      }

      checkbox.on("input", () => {
        settings[name] = !checkbox.attr("checked");

        checkbox.attr("checked", !checkbox.attr("checked"));
        checkboxContent.toggleClass("checkbox_checked_yes");

        chrome.storage.local.set({ "nkSetting": settings });
      });
    }
  });
})();