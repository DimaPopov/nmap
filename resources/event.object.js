'use strict';

/**
 * Технический модуль, для отслеживания открытия объекта
 */

(function () {
  let config = window.appChrome.config;
  const popupShow = window.appChrome.popupShow;

  let settingFavoriteObjects = {};
  chrome.storage.local.get(["nkSetting-favoriteObjects"], (result) => settingFavoriteObjects = result["nkSetting-favoriteObjects"] ? result["nkSetting-favoriteObjects"] : {'user-objects': {}});

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
    const hesh_user = window.location.href.replace("https://n.maps.yandex.ru/#!/", "").replace("https://mapeditor.yandex.com/#!/", "");

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


    /* Если это не карточка объекта, то ничего не делаем */
    if (ID === 0) return;

    /* Добавим кнопку добавляени объекта в любимые */
    if (settingMaster["favorite-objects"]) {
      const headerObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-control-only-layout.nk-primary-type-control.nk-form__control");

      if (headerObject.length) {
        const blockFavoriteObjects = $(".nk-favorite-objects .nk-favorite-objects_user-list");

        if (!headerObject.find(".nk-button-favorite-object").length) {
          const nameObject = headerObject.find(".nk-geoobject-icon").attr("class").replaceAll("nk-primary-type-control__icon", "").replaceAll("nk-geoobject-icon_id_", "").replaceAll("nk-geoobject-icon", "").trim();
          const activeStatus = settingFavoriteObjects["user-objects"][nameObject] !== undefined;

          if (activeStatus) {
            headerObject.append('<div class="nk-button-favorite-object"><svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.205 5.599c.9541.954 1.4145 2.2788 1.4191 3.6137 0 3.0657-2.2028 5.7259-4.1367 7.5015-1.2156 1.1161-2.5544 2.1393-3.9813 2.9729L12 20.001l-.501-.3088c-.9745-.5626-1.8878-1.2273-2.7655-1.9296-1.1393-.9117-2.4592-2.1279-3.5017-3.5531-1.0375-1.4183-1.8594-3.1249-1.8597-4.9957-.0025-1.2512.3936-2.5894 1.419-3.6149 1.8976-1.8975 4.974-1.8975 6.8716 0l.3347.3347.336-.3347c1.8728-1.8722 4.9989-1.8727 6.8716 0z"></path></svg></div>');
          } else {
            headerObject.append('<div class="nk-button-favorite-object"><svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.205 5.599c.9541.954 1.4145 2.2788 1.4191 3.6137 0 3.0657-2.2028 5.7259-4.1367 7.5015-1.2156 1.1161-2.5544 2.1393-3.9813 2.9729L12 20.001l-.501-.3088c-.9745-.5626-1.8878-1.2273-2.7655-1.9296-1.1393-.9117-2.4592-2.1279-3.5017-3.5531-1.0375-1.4183-1.8594-3.1249-1.8597-4.9957-.0025-1.2512.3936-2.5894 1.419-3.6149 1.8976-1.8975 4.974-1.8975 6.8716 0l.3347.3347.336-.3347c1.8728-1.8722 4.9989-1.8727 6.8716 0zm-7.2069 12.0516c.6695-.43 1.9102-1.2835 3.1366-2.4096 1.8786-1.7247 3.4884-3.8702 3.4894-6.0264-.0037-.849-.2644-1.6326-.8333-2.2015-1.1036-1.1035-2.9413-1.0999-4.0445.0014l-1.7517 1.7448-1.7461-1.7462c-1.1165-1.1164-2.9267-1.1164-4.0431 0-1.6837 1.6837-.5313 4.4136.6406 6.0156.8996 1.2298 2.0728 2.3207 3.137 3.1722a24.3826 24.3826 0 0 0 2.0151 1.4497z"></path></svg></div>');
          }

          const button = headerObject.find(".nk-button-favorite-object");

          popupShow(button, !activeStatus ? "Добавить объект в любимые" : "Удалить объект из любимых");
          button.on("click", () => {
            const activeStatus = settingFavoriteObjects["user-objects"][nameObject] !== undefined;

            let object = headerObject.text();
            object = object[0].toUpperCase() + object.slice(1);

            let rubric = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-business-main-rubric-viewer-view__rubric");
            rubric = rubric.length ? rubric.text() : "";

            if (activeStatus) {
              button.html('<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.205 5.599c.9541.954 1.4145 2.2788 1.4191 3.6137 0 3.0657-2.2028 5.7259-4.1367 7.5015-1.2156 1.1161-2.5544 2.1393-3.9813 2.9729L12 20.001l-.501-.3088c-.9745-.5626-1.8878-1.2273-2.7655-1.9296-1.1393-.9117-2.4592-2.1279-3.5017-3.5531-1.0375-1.4183-1.8594-3.1249-1.8597-4.9957-.0025-1.2512.3936-2.5894 1.419-3.6149 1.8976-1.8975 4.974-1.8975 6.8716 0l.3347.3347.336-.3347c1.8728-1.8722 4.9989-1.8727 6.8716 0zm-7.2069 12.0516c.6695-.43 1.9102-1.2835 3.1366-2.4096 1.8786-1.7247 3.4884-3.8702 3.4894-6.0264-.0037-.849-.2644-1.6326-.8333-2.2015-1.1036-1.1035-2.9413-1.0999-4.0445.0014l-1.7517 1.7448-1.7461-1.7462c-1.1165-1.1164-2.9267-1.1164-4.0431 0-1.6837 1.6837-.5313 4.4136.6406 6.0156.8996 1.2298 2.0728 2.3207 3.137 3.1722a24.3826 24.3826 0 0 0 2.0151 1.4497z"></path></svg>');
              delete settingFavoriteObjects["user-objects"][nameObject];

              /* Удалим кнопку из левого меню */
              blockFavoriteObjects.find('.nk-geoobject-icon.nk-geoobject-icon_id_' + nameObject).parent().remove();
            } else {
              button.html('<svg focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.205 5.599c.9541.954 1.4145 2.2788 1.4191 3.6137 0 3.0657-2.2028 5.7259-4.1367 7.5015-1.2156 1.1161-2.5544 2.1393-3.9813 2.9729L12 20.001l-.501-.3088c-.9745-.5626-1.8878-1.2273-2.7655-1.9296-1.1393-.9117-2.4592-2.1279-3.5017-3.5531-1.0375-1.4183-1.8594-3.1249-1.8597-4.9957-.0025-1.2512.3936-2.5894 1.419-3.6149 1.8976-1.8975 4.974-1.8975 6.8716 0l.3347.3347.336-.3347c1.8728-1.8722 4.9989-1.8727 6.8716 0z"></path></svg>');
              settingFavoriteObjects["user-objects"][nameObject] = {
                object: object,
                rubric: rubric
              };

              /* Добавим кнопку в левое меню */
              blockFavoriteObjects.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_' + nameObject + '"></div></a>');

              popupShow(blockFavoriteObjects.find('.nk-geoobject-icon.nk-geoobject-icon_id_' + nameObject), rubric ? rubric : object);
              blockFavoriteObjects.find('.nk-geoobject-icon.nk-geoobject-icon_id_' + nameObject).on("click", () => {
                setTimeout(() => {
                  const input = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-suggest .nk-text-input__control");

                  input.val(rubric ? rubric : object);

                  input[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
                  input[0].dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
                  input[0].dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                  input[0].dispatchEvent(new Event('input', { bubbles: true }));
                  input[0].dispatchEvent(new Event('change', { bubbles: true }));
                }, 15);
              });
            }

            chrome.storage.local.set({"nkSetting-favoriteObjects": settingFavoriteObjects});
          });
        }
      }
    }

    /* Если объект в стоп-листе, то ничего не делаем */
    if (stopList.indexOf(ID) !== -1) return;

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
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        check = false;

        if (response.data[0].error) return;
        const info = response.data[0].data.geoObject;

        if (Number(info.id) != ID) return;

        /* Объект оказался неподходящей категории, предварительные проверки оказались ложны. Добавляем в стоп-лист */
        if (info.categoryId.indexOf(setting.category) === -1) {
          stopList.push(ID);
          return;
        }

        let moderRoad = false;

        if (window.appChrome.user.expertise && window.appChrome.user.expertise.moderatorExpertise) {
          window.appChrome.user.expertise.moderatorExpertise.forEach((zone) => {
            if (zone.categoryGroupIds.indexOf("rd_group") !== -1) moderRoad = true;
          });
        }

        /* Модуль для этой категории отключен, добавляем объект в стоп-лист */
        if (!settingMaster["object:" + setting.category] || setting.category === "rd_el" && !moderRoad && !window.appChrome.user.yandex) {
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