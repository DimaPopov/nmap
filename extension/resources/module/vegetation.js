'use strict';

/**
 * Добавляет возможность отобразить информацию о детальном отображении парков
 */

(function () {
  /* Объекты, информация о которых не должны будет проверяться повторно, так как они не подходят */
  let stopList = [];

  const popupShow = window.appChrome.popupShow;

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

        parent.append('<div class="nk-vegetation-system nk-control-only-layout nk-boolean-text-control nk-form__control"><span class="nk-boolean-text-control__value">Детальное отображение</span><span class="nk-icon nk-icon_id_help-small nk-icon_align_auto nk-system__info-icon"><svg xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd" transform="scale(0.7) translate(5, 5)"><path d="M11 21c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm0-1.8c4.529 0 8.2-3.671 8.2-8.2s-3.671-8.2-8.2-8.2-8.2 3.671-8.2 8.2 3.671 8.2 8.2 8.2zM10.885 6.048c.956 0 1.751.229 2.384.686.633.457.949 1.134.949 2.031 0 .55-.138 1.014-.413 1.39-.161.229-.47.521-.927.876l-.451.349c-.245.19-.408.413-.489.667-.051.161-.078.41-.083.749h-1.714c.025-.715.093-1.209.203-1.482.11-.273.394-.587.851-.943l.463-.362c.152-.114.275-.239.368-.375.169-.233.254-.489.254-.768 0-.322-.094-.615-.282-.879-.188-.264-.532-.397-1.031-.397-.491 0-.839.163-1.044.489-.205.326-.308.664-.308 1.016h-1.834c.051-1.206.472-2.061 1.263-2.564.499-.322 1.113-.482 1.841-.482zM10 14h2v2h-2v-2z"></path></g></svg></span></div>');

        popupShow($(".nk-vegetation-system .nk-icon_id_help-small"), "Для этого объекта сотрудники Яндекса включили детальное отображение растительности");
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