'use strict';

/**
 * Скрипт для раздела модулей
 */

(function () {
  let settings = {};

  const renderSetting = () => {
    for (let name in settings) {
      const id = name.replace(":", "_");
      const value = settings[name];
      const checkbox = $("#" + id);
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
  };

  chrome.storage.local.get(["nkSetting"], (result) => {
    settings = result.nkSetting;

    if (!settings) {
      chrome.runtime.sendMessage({method: "setSetting"}, (response) => {
        settings = response.response;

        renderSetting();
      });
    }else {
      renderSetting();
    }
  });
})();