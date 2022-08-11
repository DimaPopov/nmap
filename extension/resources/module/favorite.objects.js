'use strict';

/**
 * Добавляет возможность выбора любимых объектов
 */

(function () {
  let settingFavoriteObjects = {};
  const popupShow = window.appChrome.popupShow;

  chrome.storage.local.get(["nkSetting-favoriteObjects"], (result) => {
    if (!result["nkSetting-favoriteObjects"]) {
      const default_setting = {
        'rd': false,
        'bld': false,
        'addr': false,
        'org': false,
        'transport': false,
        'vegetation': false,
        'relief': false,
        'hydro': false,
        'urban': false,
        'urban-roadnet': false,
        'ad': false,
        'roadnet': false,
        'category-urban-roadnet-parking-lot': false,
        'user-objects': {}
      };

      chrome.storage.local.set({"nkSetting-favoriteObjects": default_setting});
      settingFavoriteObjects = default_setting;
    } else {
      settingFavoriteObjects = result["nkSetting-favoriteObjects"];
    }
  });


  /**
   * Инициализация модуля
   */

  const initModule = () => {
    const elementAfter = $(".nk-map-left-controls-view > .nk-indoor-bar-view");

    elementAfter.before('<div class="nk-favorite-objects nk-button nk-button_theme_air nk-button_size_l"></div>');
    let parent = $(".nk-favorite-objects");

    /* Добавим включеныне категории в левое меню */
    for (const name in settingFavoriteObjects) {
      if (name == "user-objects") continue;

      const status = settingFavoriteObjects[name];
      const id = name.indexOf("category-") !== -1 ? "" : "group-";

      if (status) {
        parent.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_'+ id + name + '"></div></a>');
        const button = parent.find(".nk-geoobject-icon_id_"+ id + name);

        let popup = name + "-group";
        if (name == "category-urban-roadnet-parking-lot") popup = "parking-group";
        if (name == "org") popup = "poi-group";

        popup = window.appChrome.text.categories[popup].title;
        popupShow(button, popup);

        // Добавим событие клика на кнопку для открытия меню создания
        button.on("click", () => {
          setTimeout(() => {
            $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-geoobject-icon.nk-geoobject-icon_id_" + id + name).click();
          }, 10);
        });
      }
    }

    /* Добавим объекты выбранные через редактор */
    parent.append('<div class="nk-favorite-objects_user-list"></div>');
    parent = parent.find(".nk-favorite-objects_user-list");

    for (const name in settingFavoriteObjects["user-objects"]) {
      const info = settingFavoriteObjects["user-objects"][name];

      parent.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_'+ name + '"></div></a>');
      const button = parent.find(".nk-geoobject-icon_id_"+ name);

      const popup = info.rubric ? info.rubric : info.object;
      popupShow(button, popup);

      // Добавим событие клика на кнопку для открытия меню создания
      button.on("click", () => {
        setTimeout(() => {
          const input = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-suggest .nk-text-input__control");

          input.val(popup);

          input[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
          input[0].dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
          input[0].dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          input[0].dispatchEvent(new Event('input', { bubbles: true }));
          input[0].dispatchEvent(new Event('change', { bubbles: true }));
        }, 15);
      });
    }
  };

  window.appChrome.init.favoriteObject = initModule;
})();