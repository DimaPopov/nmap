'use strict';

/**
 * Скрипт управления модулем поиска пользователей
 */

(function () {
  let settingUser = {};

  chrome.storage.local.get(["nkSetting-getUser"], (result) => {
    if (!result["nkSetting-getUser"]) {
      const default_setting = {
        'view': {
          'total-edits': true,
          'rating-pos-full': true,
          'feedback-count': true,
          'category-group': false,
        }
      };

      chrome.storage.local.set({"nkSetting-getUser": default_setting});
      settingUser = default_setting;
    } else {
      settingUser = result["nkSetting-getUser"];
    }

    for (const name in settingUser.view) {
      const value = settingUser.view[name];

      const id = "#" + name;
      const element = $(id);
      const checkboxContent = element.parent().parent();

      if (value) {
        element.attr("checked", true);
        checkboxContent.addClass("checkbox_checked_yes");
      }

      element.on("input", () => {
        settingUser.view[name] = !element.attr("checked");

        element.attr("checked", !element.attr("checked"));
        checkboxContent.toggleClass("checkbox_checked_yes");

        chrome.storage.local.set({ "nkSetting-getUser": settingUser });
      });
    }

    console.log(settingUser);
  });
})();