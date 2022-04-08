'use strict';

/**
 * Добавляет возможность отобразить информацию о детальном отображении парков
 */

(function () {
  /* Объекты, информация о которых не должны будет проверяться повторно, так как они не подходят */
  let stopList = [];

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
    const ID = Number(checkShow());
    if (ID === 0 || stopList.indexOf(ID) !== -1) return;

    let sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view .nk-scrollable__content .nk-size-observer > div > .nk-section.nk-form");
    let sectionElement = $(sectionsElement[0]);

    /* Если уже есть информация, то не добавляем её снова */
    if ($(".nk-vegetation-system")[0]) return;

    sectionElement.after('<div class="nk-section nk-section_level_2 nk-vegetation-system"></div>');
    let parent = sectionElement.parent().find(".nk-vegetation-system");


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
        if (response.data[0].error) {
          parent.remove();
          return;
        }

        const info = response.data[0].data.geoObject;

        if (info.categoryId !== "vegetation" || info.attrs["vegetation:disp_class"] !== "8") {
          parent.remove();
          stopList.push(ID);
          return;
        }

        parent.append('<div class="nk-vegetation-system nk-control-only-layout nk-boolean-text-control nk-form__control"><span class="nk-boolean-text-control__value">Детальное отображение</span></div>');
      }
    });
  });

  /**
   * Инициализация модуля
   */

  const initVegetation = () => {
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.vegetation = initVegetation;
})();