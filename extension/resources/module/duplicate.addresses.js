'use strict';

/**
 * Добавляет возможность поиска дубликатов адресов
 */

(function () {
  let stopList = [];
  let cash = {};
  let load = false;

  /**
   * Проверка необходимости подгрузки информации
   * @returns {boolean}
   */

  const checkShow = () => {
    const element = $(".nk-sidebar-view.nk-island:not([style])");
    const hesh_url = window.location.href.replace("https://n.maps.yandex.ru/#!/", "");

    /* Проверим, неточность ли */
    if (hesh_url.indexOf("objects/") === -1) return false;
    if (!element[0]) return false;

    return hesh_url.split("/")[1].split("?")[0];
  };


  const searchSlaves = (objectID, typeObject, address) => {
    const config = JSON.parse($("#config").text());

    const data = [
      {
        "method": "editor/getGeoObjectSlaves",
        "params": {
          "id": objectID,
          "branch": "0",
          "limit": 10000,
          "categoryId": "addr",
          "roleId": typeObject === "rd" ? "associated_with" : "addr_associated_with",
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      },
    ];

    $.ajax({
      type: "POST",
      headers: {
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.data[0].error) return;

        const info = response.data[0].data.slaves;
        load = false;

        const warnings = info.filter(active_address => active_address.title === address.text && active_address.id != address.id);

        if (warnings.length > 0) {
          const addressBlock = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-size-observer .nk-island:nth-child(1) .nk-scrollable__content > div");
          const count_dublicate = warnings.length % 2 === 0 ? warnings.length + " дубликата" : warnings.length + " дублкиат";

          if (!addressBlock.find(".nk-poi-conflicts-viewer-view")[0]) {
            addressBlock.prepend('<div class="nk-poi-conflicts-viewer-view nk-section nk-section_level_2"><div class="nk-poi-conflicts-viewer-view__header">' + count_dublicate + ' адреса</div><div class="nk-poi-conflicts-viewer-view__zoom-level"><div><div class="nk-poi-conflicts-viewer-view__geoobject"></div></div></div></div>');
            const parrent = $(".nk-poi-conflicts-viewer-view .nk-poi-conflicts-viewer-view__geoobject");

            warnings.forEach((warning) => {
              parrent.append('<a role="link" class="nk-link nk-link_theme_islands nk-geoobject-link-view nk-geoobject-link-view_with-preview nk-poi-conflicts-viewer-view__geoobject-link nk-poi-conflicts-viewer-view__geoobject-link_severity_critical nk-address-dublicate" href="/#!/objects/' + warning.id + '">' + warning.title + '</a>');
            });
          }
        }
      }
    });
  }


  /**
   * Отслеживание изменений в окне редактора
   */

  const editAppView = new MutationObserver(() => {
    if (load) return;

    let objectID = checkShow();
    if (!objectID) return;

    if (stopList.indexOf(objectID) !== -1) return;

    if (objectID === cash.id) {
      searchSlaves(cash.master.id, cash.master.categoryId, {text: cash.info.title, id: cash.info.id});
      return;
    }

    load = true;

    /* Получим информацию об объекте */
    const config = JSON.parse($("#config").text());
    const data = [
      {
        "method": "editor/getGeoObject",
        "params": {
          "id": objectID + "",
          "branch": "0",
          "token": JSON.parse(localStorage.getItem("nk:token")),
          "allowSubstitution": false,
        }
      },
    ];

    $.ajax({
      type: "POST",
      headers: {
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.data[0].error) {
          load = false;
          return;
        }
        const info = response.data[0].data.geoObject;

        if (info.categoryId !== "addr") {
          stopList.push(objectID);
          return;
        }

        const master = info.masters.associated_with.geoObjects[0];
        searchSlaves(master.id, master.categoryId, {text: info.title, id: info.id});

        cash = {
          id: objectID,
          info: {
            title: info.title,
            id: info.id
          },
          master: {
            id: master.id,
            categoryId: master.categoryId
          }
        }
      }
    });
  });


  /**
   * Инициализация модуля
   */

  const creatAddress = () => {
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.addressDuplicate = creatAddress;
})();