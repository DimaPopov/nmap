'use strict';

/**
 * Скрипт управления модулем любимых объектов
 */

(function () {
  let settingFavoriteObjects = {};

  chrome.storage.local.get(["nkSetting-favoriteObjects"], (result) => {
    if (!result["nkSetting-favoriteObjects"]) {
      const default_setting = {
        'rd': false,
        'bld': false,
        'addr': false,
        'org': false,
        'transport': false,
        'vegetation': false,
        'relief': false,
        'hydro': false,
        'urban': false,
        'urban-roadnet': false,
        'ad': false,
        'category-urban-roadnet-parking-lot': false,
        'parking': false,
        'user-objects': {}
      };

      chrome.storage.local.set({"nkSetting-favoriteObjects": default_setting});
      settingFavoriteObjects = default_setting;
    } else {
      settingFavoriteObjects = result["nkSetting-favoriteObjects"];
    }

    for (const name in settingFavoriteObjects) {
      const value = settingFavoriteObjects[name];

      const id = "input[nk-name='" + name + "']";
      const element = $(id);
      const checkboxContent = element.parent().parent();

      if (value) {
        element.attr("checked", true);
        checkboxContent.addClass("checkbox_checked_yes");
      }

      element.on("input", () => {
        settingFavoriteObjects[name] = !element.attr("checked");

        element.attr("checked", !element.attr("checked"));
        checkboxContent.toggleClass("checkbox_checked_yes");

        chrome.storage.local.set({ "nkSetting-favoriteObjects": settingFavoriteObjects });
      });
    }
  });
})();