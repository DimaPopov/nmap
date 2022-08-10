'use strict';

/**
 * Добавляет возможность выбора любимых объектов
 */

(function () {
  let creatMeny = null;

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
        'category-urban-roadnet-parking-lot': false
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
    const element = $(".nk-favorite-objects");

    // Добавим включеныне категории в левое меню
    for (const name in settingFavoriteObjects) {
      const status = settingFavoriteObjects[name];
      const id = name.indexOf("category-") !== -1 ? "" : "group-";

      if (status) {
        element.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_'+ id + name + '"></div></a>');

        const button = $(".nk-favorite-objects .nk-geoobject-icon_id_"+ id + name);

        let popup = name + "-group";
        if (name == "category-urban-roadnet-parking-lot") popup = "parking-group";
        if (name == "org") popup = "poi-group";

        popup = window.appChrome.text.categories[popup].title;
        popupShow(button, popup);

        // Добавим событие клика на кнопку для открытия меню создания
        button.on("click", () => {
          setTimeout(() => {
            $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-geoobject-icon.nk-geoobject-icon_id_" + id + name).click();
          }, 5);
        });
      }
    }
  };

  window.appChrome.init.favoriteObject = initModule;
})();