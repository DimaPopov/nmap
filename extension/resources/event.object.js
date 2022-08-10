'use strict';

/**
 * Технический модуль, для отслеживания открытия объекта
 */

(function () {
  let config = window.appChrome.config;

  /* Мастер-настройки, получаемые от init модуля */
  let settingMaster;

  /* Стоп-лист объектов */
  let stopList = [];

  /* Список бъектов, требующих отслеживания */
  let object_list = [];

  /* Идёт ли проверка в данный момент */
  let check = false;

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
    if (check) return;

    const ID = Number(checkShow());
    const title = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-sidebar-header-view__title-text").text();


    /* Если это не карточка объекта или объект в стоп-листе, то ничего не делаем */
    if (ID === 0 || stopList.indexOf(ID) !== -1) return;

    /* Ищим объект в списке отслеживаемых, если ткаого вида объекта нет в списке, то ставим его в стоп-лист */
    let ID_setting = -1;
    check = true;

    object_list.forEach((object, ID_active) => {
      if (object.title.indexOf(title) !== -1) {
        ID_setting = ID_active;
        return false;
      }
    });

    if (ID_setting === -1) {
      stopList.push(ID);
      check = false;

      return;
    }

    const setting = object_list[ID_setting];

    /* Выполняем более детальную проверку данных */
    if (setting.check(ID)) {
      check = false;
      return;
    }

    /* Получим информацию об объекте */
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
        'content-type': 'text/plain;charset=UTF-8',
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        check = false;

        if (response.data[0].error) return;
        const info = response.data[0].data.geoObject;

        if (Number(info.id) != ID) return;

        /* Объект оказался неподходящей категории, предвариетльные проверки оказались ложны. Добавляем в стоп-лист */
        if (info.categoryId.indexOf(setting.category) === -1) {
          stopList.push(ID);
          return;
        }

        /* Модуль для этой категории отключен, добавляем объект в стоп-лист */
        if (!settingMaster["object:" + setting.category] || setting.category === "rd_el" && window.appChrome.user.expertise.moderatorExpertise[0].categoryGroupIds.indexOf("rd_group") === -1 && !window.appChrome.user.yandex) {
          stopList.push(ID);
          return;
        }

        setting.render(info);
      }
    });
  });


  /**
   * Добавление отслеживаемого объекта
   *
   * @param setting - Настройки отслеживания
   */

  const appendEventObject = (setting) => {
    object_list.push(setting);
  };


  /**
   * Добавление объекта в стоп-лист
   *
   * @param ID - ID объекта
   */

  const appendStorList = (ID) => {
    stopList.push(Number(ID));
  };


  /**
   * Инициализация модуля
   */

  const initEventObject = (setting) => {
    config = window.appChrome.config;

    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});

    settingMaster = setting;
  };


  window.appChrome.eventObect = {
    append: appendEventObject,
    stop: appendStorList
  }

  window.appChrome.init.eventObject = initEventObject;
})();