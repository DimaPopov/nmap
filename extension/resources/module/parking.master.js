'use strict';

/**
 * Добавляет возможность отобразить информацию о парковочной зоне
 */

(function () {
  /* Объекты, информация о которых не должны будет проверяться повторно, так как они не подходят */
  let stopList = [];
  let load = false;


  /**
   * Проверка необходимости подгрузки информации
   * @returns {boolean}
   */

  const checkShow = () => {
    const element = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style])");
    const hesh_user = window.location.href.replace("https://n.maps.yandex.ru/#!/", "");

    /* Проверим, объект ли открыт */
    if (hesh_user.indexOf("objects/") === -1) return false;
    if (!element[0]) return false;

    const id = hesh_user.split("/")[1].split("?")[0];

    return id;
  };

  /**
   * Отслеживание изменений в окне редактора
   */

  const editAppView = new MutationObserver(() => {
    if (load) return;

    const ID = Number(checkShow());
    if (ID === 0 || stopList.indexOf(ID) !== -1) return;

    let sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-scrollable__content .nk-size-observer > div > .nk-section");
    let sectionElement = $(sectionsElement[0]);

    /* Если уже есть информация, то не добавляем её снова */
    if ($(".nk-parking-master-system")[0]) return;
    load = true;

    /* Получим информацию об объекте */
    const config = JSON.parse($("#config").text());

    const data = [
      {
        "method": "editor/getGeoObject",
        "params": {
          "id": ID + "",
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
        load = false;
        if (response.data[0].error) return;

        const info = response.data[0].data.geoObject;
        let value = "";

        if (info.masters) {
          if (!info.masters.parking_lot_linear_assigned) {
            stopList.push(ID);
            return;
          }

          value = info.masters.parking_lot_linear_assigned.geoObjects[0].title;
          const title = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-sidebar-header-view__title .nk-sidebar-header-view__title-text");

          console.log(title[0], value);

          title.text(value);
          title.addClass("nk-parking-master-system");
        }else if (info.title.indexOf("{{") === -1 && (info.title.indexOf("Парковка") !== -1 || info.title.indexOf("Парковочная") !== -1)) {
          sectionElement.prepend('<div class="nk-parking-master-system nk-form__group nk-section nk-section_level_2"><div class="nk-grid nk-list-control nk-form__control"><div class="nk-grid__col nk-grid__col_span_4"><label class="nk-form-control__label">Название</label></div><div class="nk-grid__col nk-grid__col_span_8"><div class="nk-name-row-layout"><div class="nk-name-row-layout__name"><div class="nk-text-control__text"><span dir="auto">' + info.title + '<span></div></div></div></div></div></div>');
        }else {
          stopList.push(ID);
        }
      }
    });
  });

  /**
   * Инициализация модуля
   */

  const initParking = () => {
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.parking = initParking;
})();