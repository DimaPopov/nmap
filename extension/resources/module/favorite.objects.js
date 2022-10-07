'use strict';

/**
 * Добавляет возможность выбора любимых объектов
 */

(function () {
  let settingFavoriteObjects = {};
  const popupShow = window.appChrome.popupShow;

  chrome.storage.local.get(["nkSetting-favoriteObjects"], (result) => {
    if (!result["nkSetting-favoriteObjects"]) {
      const DEFAULT_SETTING = {
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
        'category-urban-roadnet-parking-lot': false,
        'parking': false,
        'category-urban-roadnet-fence-el': false,
        'user-objects': {}
      };

      chrome.storage.local.set({"nkSetting-favoriteObjects": DEFAULT_SETTING});
      settingFavoriteObjects = DEFAULT_SETTING;
    } else {
      settingFavoriteObjects = result["nkSetting-favoriteObjects"];
    }
  });


  /**
   * Открытие интерфейса создания дороги
   */

  const creatRd = (name) => {
    const menu_button = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-link.nk-category-selector-groups-view__group.nk-category-selector-groups-view__group_id_rd");

    // Если не открылось меню создания объекта, значит что-то не так и нужно прервать функцию
    if (!menu_button.length) return;
    window.appChrome.triggerClick(menu_button);

    setTimeout(() => {
      // Проверим, есть ли подменю
      const menu = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-list-item-view.nk-list-item-view_interactive .nk-geoobject-icon.nk-geoobject-icon_id_group-rd");
      if (menu.length) window.appChrome.triggerClick(menu);

      setTimeout(() => {
        const category = $(".nk-sidebar-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-form__group .nk-control-only-layout .nk-button_view_plain");
        window.appChrome.triggerClick(category);

        setTimeout(() => {
          const select = $(".nk-popup.nk-popup_visible .nk-menu-item .nk-geoobject-icon.nk-geoobject-icon_id_" + name);
          window.appChrome.triggerClick(select);

          setTimeout(() => category.removeClass("nk-button_focused_hard"), 15);
        }, 10);
      }, menu.length ? 15 : 0);
    }, 15);
  };


  /**
   * Открытие интерфейса создания здания
   */

  const creatBld = (name) => {
    const menu_button = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-link.nk-category-selector-groups-view__group.nk-category-selector-groups-view__group_id_bld");

    // Если не открылось меню создания объекта, значит что-то не так и нужно прервать функцию
    if (!menu_button.length) return;
    window.appChrome.triggerClick(menu_button);

    setTimeout(() => {
      const category = $(".nk-sidebar-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-form__group .nk-control-only-layout .nk-button_view_plain");
      window.appChrome.triggerClick(category);

      setTimeout(() => {
        const select = $(".nk-popup.nk-popup_visible .nk-menu-item .nk-geoobject-icon.nk-geoobject-icon_id_" + name);
        window.appChrome.triggerClick(select);

        setTimeout(() => category.removeClass("nk-button_focused_hard"), 15);
      }, 10);
    }, 15);
  };


  /**
   * Открытие интерфейса создания POI
   */

  const creatPoi = (info) => {
    const menu_button = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-link.nk-category-selector-groups-view__group.nk-category-selector-groups-view__group_id_org");

    // Если не открылось меню создания объекта, значит что-то не так и нужно прервать функцию
    if (!menu_button.length) return;
    window.appChrome.triggerClick(menu_button);

    setTimeout(() => {
      const menu = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-list-item-view.nk-list-item-view_interactive .nk-geoobject-icon.nk-geoobject-icon_id_category-" + info.categoryId.replaceAll("_", "-"));
      window.appChrome.triggerClick(menu);

      setTimeout(() => {
        const category = $(".nk-sidebar-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-form__group .nk-control-only-layout .nk-button_view_plain");
        window.appChrome.triggerClick(category);

        setTimeout(() => {
          const select = $(".nk-popup.nk-popup_visible .nk-menu-item .nk-primary-type-edit-control__option:contains(\"" + (info.object[0].toLowerCase() + info.object.slice(1)) + "\")");
          window.appChrome.triggerClick(select);

          // Выберим рубрику
          window.appChrome.triggerClick($(".nk-sidebar-view:not([style]) .nk-business-main-rubric-editor-view__suggest .nk-text-input__clear"));

          setTimeout(() => {
            const input = $(".nk-sidebar-view:not([style]) .nk-business-main-rubric-editor-view__suggest input");
            input.focus();

            setTimeout(() => {
              const rubric = $(".nk-popup.nk-popup_visible .nk-popup__content .nk-suggest__item:contains(\"" + info.rubric + "\")");
              window.appChrome.triggerClick(rubric);
              input.blur()
            }, 240);
          }, 10);
        }, 10);
      }, 15);
    }, 15);
  };


  /**
   * Открытие интерфейса создания растительности
   */

  const creatVegetation = (name) => {
    const menu_button = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-link.nk-category-selector-groups-view__group.nk-category-selector-groups-view__group_id_vegetation");

    // Если не открылось меню создания объекта, значит что-то не так и нужно прервать функцию
    if (!menu_button.length) return;
    window.appChrome.triggerClick(menu_button);

    setTimeout(() => {
      // Проверим, есть ли подменю
      const menu = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-list-item-view.nk-list-item-view_interactive:first-child .nk-geoobject-icon.nk-geoobject-icon_id_group-vegetation");
      if (menu.length) window.appChrome.triggerClick(menu);

      setTimeout(() => {
        const category = $(".nk-sidebar-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-form__group .nk-control-only-layout .nk-button_view_plain");
        window.appChrome.triggerClick(category);

        setTimeout(() => {
          const select = $(".nk-popup.nk-popup_visible .nk-menu-item .nk-geoobject-icon.nk-geoobject-icon_id_" + name);
          window.appChrome.triggerClick(select);

          setTimeout(() => category.removeClass("nk-button_focused_hard"), 15);
        }, 10);
      }, menu.length ? 15 : 0);
    }, 15);
  };


  /**
   * Открытие интерфейса создания гидрографии
   */

  const creatHydro = (name) => {
    const menu_button = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-link.nk-category-selector-groups-view__group.nk-category-selector-groups-view__group_id_hydro");

    // Если не открылось меню создания объекта, значит что-то не так и нужно прервать функцию
    if (!menu_button.length) return;
    window.appChrome.triggerClick(menu_button);

    setTimeout(() => {
      // Проверим, есть ли подменю
      const menu = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-list-item-view.nk-list-item-view_interactive:first-child .nk-geoobject-icon.nk-geoobject-icon_id_category-hydro");
      if (menu.length) window.appChrome.triggerClick(menu);

      setTimeout(() => {
        const category = $(".nk-sidebar-view:not([style]) .nk-form.nk-section.nk-section_level_2 .nk-form__group .nk-control-only-layout .nk-button_view_plain");
        window.appChrome.triggerClick(category);

        setTimeout(() => {
          const select = $(".nk-popup.nk-popup_visible .nk-menu-item .nk-geoobject-icon.nk-geoobject-icon_id_" + name);
          window.appChrome.triggerClick(select);

          setTimeout(() => category.removeClass("nk-button_focused_hard"), 15);
        }, 10);
      }, menu.length ? 15 : 0);
    }, 15);
  };


  /**
   * Инициализация модуля
   */

  const initModule = () => {
    const elementAfter = $(".nk-map-left-controls-view > .nk-indoor-bar-view");

    elementAfter.before('<div class="nk-favorite-objects nk-button nk-button_theme_air nk-button_size_l"></div>');
    let parent = $(".nk-favorite-objects");

    /* Добавим включенные категории в левое меню */
    for (const name in settingFavoriteObjects) {
      if (name == "user-objects") continue;

      const status = settingFavoriteObjects[name];
      const id = name.indexOf("category-") !== -1 ? "" : "group-";

      if (status) {
        parent.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_'+ id + name + '"></div></a>');
        const button = parent.find(".nk-geoobject-icon_id_"+ id + name);

        let popup = name + "-group";
        if (name == "category-urban-roadnet-parking-lot") popup = "parking-group";
        if (name == "category-urban-roadnet-fence-el") popup = "fence-group";
        if (name == "org") popup = "poi-group";

        popup = window.appChrome.text.categories[popup].title;
        popupShow(button, popup);

        // Добавим событие клика на кнопку для открытия меню создания
        button.on("click", () => {
          setTimeout(() => {
            if (name == "category-urban-roadnet-fence-el") {
              $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-geoobject-icon.nk-geoobject-icon_id_group-urban-roadnet").click();

              setTimeout(() => {
                const menu = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-list-item-view.nk-list-item-view_interactive .nk-geoobject-icon.nk-geoobject-icon_id_category-urban-roadnet-fence-el");
                window.appChrome.triggerClick(menu);
              }, 15);
            }else {
              $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-category-selector-groups-view__content .nk-geoobject-icon.nk-geoobject-icon_id_" + id + name).click();
            }
          }, 10);
        });
      }
    }

    /* Добавим объекты выбранные через редактор */
    parent.append('<div class="nk-favorite-objects_user-list"></div>');
    parent = parent.find(".nk-favorite-objects_user-list");

    for (const name in settingFavoriteObjects["user-objects"]) {
      const info = settingFavoriteObjects["user-objects"][name];
      const saveName = info.rubric ? info.rubric : info.object;

      parent.append('<a href="#!/create"><div class="nk-geoobject-icon nk-geoobject-icon_id_'+ info.icon + '" data-name="' + saveName + '"></div></a>');
      const button = parent.find('.nk-geoobject-icon_id_' + info.icon + '[data-name="' + saveName + '"]');

      const popup = info.rubric ? info.rubric : info.object;
      popupShow(button, popup);

      // Добавим событие клика на кнопку для открытия меню создания
      button.on("click", () => {
        setTimeout(() => {
          if (info.categoryId == "rd_el") {
            // Дороги
            creatRd(info.icon);
          }else if (info.categoryId == "bld") {
            // Здания
            creatBld(info.icon);
          }else if (info.categoryId.indexOf("poi_") !== -1) {
            // POI
            creatPoi(info);
          }else if (info.categoryId == "vegetation") {
            // Растительность
            creatVegetation(info.icon);
          }else if (info.categoryId == "hydro") {
            // Гидрография
            creatHydro(info.icon);
          }else {
            setTimeout(() => {
              const input = $(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-suggest .nk-text-input__control");
              input.val(saveName);

              input[0].dispatchEvent(new KeyboardEvent('keydown', {bubbles: true}));
              input[0].dispatchEvent(new KeyboardEvent('keypress', {bubbles: true}));
              input[0].dispatchEvent(new KeyboardEvent('keyup', {bubbles: true}));
              input[0].dispatchEvent(new Event('input', {bubbles: true}));
              input[0].dispatchEvent(new Event('change', {bubbles: true}));

              setTimeout(() => {
                window.appChrome.triggerClick($(".nk-sidebar-view:not(.nk-geoobject-viewer-view):not([style]) .nk-suggest  .nk-suggest__item"));
              }, 800);
            }, 15);
          }
        }, 15);
      });
    }
  };

  window.appChrome.init.favoriteObject = initModule;
})();