'use strict';

/**
 * Добавляет возможность отобразить информацию о зданиях
 */

(function () {
  const popupShow = window.appChrome.popupShow;
  let cash = [];

  /**
   * Отображение информации
   */

  const render = (info) => {
    if (cash[info.id]) {
      call(cash[info.id]);
      return;
    }

    const config = window.appChrome.config;

    const data = [
      {
        "method": "editor/getGeoObjectsByGeometry",
        "params": {
          "categories": ["addr"],
          "geometry": info.geometry,
          "token": JSON.parse(localStorage.getItem("nk:token")),
          "withAssessmentGrades": false,
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
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        cash[info.id] = response.data[0].data.geoObjects;
        call(response.data[0].data.geoObjects);
      }
    });
  };

  const call = (info) => {
    const sections = $(".nk-sidebar-view.nk-geoobject-viewer-view .nk-scrollable__content .nk-size-observer > div");
    info.forEach((item) => {
      if (window.appChrome.settingMaster["fr_mos_ru"]) {
        window.fr_mos_ru_render(sections, item.title);
      }
    });
  };


  /**
   * Подписываемся на получение уведомления об открытии объекта растительности
   */

  window.appChrome.eventObect.append({
    title: ['Здание'],
    category: "bld",
    check: () => {
      const fr_mos_ru = $("#fr_mos_ru");
      if (!localStorage.getItem("nk-appChrome-start")) return;

      return fr_mos_ru[0];
    },
    render: render
  });
})();