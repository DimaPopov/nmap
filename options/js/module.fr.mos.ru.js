'use strict';

/**
 * Скрипт для раздела Фонд реновации
 */

(function () {
  const manifest = chrome.runtime.getManifest();

  const button = $("#save-button");
  const fr_mos_ru_api = $("#fr_mos_ru_api");
  const fr_mos_ru_token = $("#fr_mos_ru_token");
  const info = $("#info");

  const formLink = $("#fr_mos_ru_form");
  formLink.attr("href", formLink.attr("href") + "?extensions_id=" + chrome.runtime.id);

  button.on("click", () => {
    settings.fr_mos_ru_api = fr_mos_ru_api.val();
    settings.fr_mos_ru_token = fr_mos_ru_token.val();

    chrome.storage.local.set({ "nkSetting": settings }, () => {
      info.attr("data-info", "Настройки сохранены");
    });
  });

  let settings = {};

  const renderSetting = () => {
    fr_mos_ru_api.val(settings.fr_mos_ru_api);
    fr_mos_ru_token.val(settings.fr_mos_ru_token);
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

  $.ajax({
    type: "GET",
    url: "https://n.maps.yandex.ru/",
    dataType: "html",
    success: function (response) {
      const config = JSON.parse(response.split('id="config"')[1].split(">")[1].split("<")[0]);

      const data = [
        {
          "method": "app/getCurrentUser",
          "params": {}
        }
      ];

      $.ajax({
        type: "POST",
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          'x-kl-ajax-request': 'Ajax_Request',
          'x-csrf-token': config.api.csrfToken,
          'x-lang': 'ru'
        },
        url: "https://n.maps.yandex.ru/" + config.api.url + "/batch",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (response) {
          const user = response.data[0].data;
          formLink.attr("href", formLink.attr("href") + "&login_nmaps=" + user.login + "&email=" + user.login + "@yandex.ru&link_nmaps=https://n.maps.yandex.ru/%23!/users/" + user.publicId);
        }
      });
    }
  });
})();