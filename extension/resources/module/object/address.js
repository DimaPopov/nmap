'use strict';

/**
 * Ищет дубликаты адресов
 */

(function () {
  let config = window.appChrome.config;

  /**
   * Отображение информации
   */

  const render = (address) => {
    config = window.appChrome.config;
    const master = address.masters.associated_with.geoObjects[0];

    const data = [
      {
        "method": "editor/getGeoObjectSlaves",
        "params": {
          "id": master.id,
          "branch": "0",
          "limit": 10000,
          "categoryId": "addr",
          "roleId": master.categoryId === "rd" ? "associated_with" : "addr_associated_with",
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      },
    ];

    $.ajax({
      type: "POST",
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.data[0].error) return;

        const info = response.data[0].data.slaves;
        const warnings = info.filter(active_address => active_address.title === address.title && active_address.id != address.id);

        const addressBlock = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-size-observer .nk-island:nth-child(1) .nk-scrollable__content > div");

        if (warnings.length > 0) {
          const count_dublicate = warnings.length % 2 === 0 ? warnings.length + " дубликата" : warnings.length + " дублкиат";

          if (!addressBlock.find(".nk-poi-conflicts-viewer-view")[0]) {
            addressBlock.prepend('<div class="nk-poi-conflicts-viewer-view nk-address-conflicts nk-section nk-section_level_2"><div class="nk-poi-conflicts-viewer-view__header">' + count_dublicate + ' адреса</div><div class="nk-poi-conflicts-viewer-view__zoom-level"><div><div class="nk-poi-conflicts-viewer-view__geoobject"></div></div></div></div>');
            const parrent = $(".nk-poi-conflicts-viewer-view .nk-poi-conflicts-viewer-view__geoobject");

            warnings.forEach((warning) => {
              parrent.append('<a role="link" class="nk-link nk-link_theme_islands nk-geoobject-link-view nk-geoobject-link-view_with-preview nk-poi-conflicts-viewer-view__geoobject-link nk-poi-conflicts-viewer-view__geoobject-link_severity_critical nk-address-dublicate" href="/#!/objects/' + warning.id + '">' + warning.title + '</a>');
            });
          }
        }else {
          addressBlock.prepend('<div class="nk-address-conflicts"></div>');
        }
      }
    });
  };


  /**
   * Подписываемся на получение уведомления об открытии схемы помещения
   */

  window.appChrome.eventObect.append({
    title: ['Адрес', 'Address'],
    category: "addr",
    check: () => {
      const addressConflictsObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-address-conflicts");

      return addressConflictsObject[0];
    },
    render: render
  });
})();