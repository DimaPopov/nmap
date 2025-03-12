'use strict';

/**
 * Добавляет возможность изменять тайлы спутниковых снимков
 */

(function () {
  const text = window.appChrome.text.tiles;
  const popupShow = window.appChrome.popupShow;
  let mapElement = null;

  const showPanel = () => {
    $(".nk-portal-local .nk-popup").removeClass("nk-popup_visible nk-popup_direction_bottom-right");

    if ($(".nk-portal_edit-tile")[0]) {
      $(".nk-portal_edit-tile .nk-popup").removeClass("nk-popup_visible");
      setTimeout(() => $(".nk-portal_edit-tile").remove(), 300);

      return;
    }

    $("body").append('<div class="nk-portal nk-portal_edit-tile"><!----><div class="nk-popup nk-popup_direction_right-bottom nk-popup_visible nk-popup_theme_islands nk-popup_restrict-height" style="left: 59px; bottom: 159px; z-index: 1001;"><div class="nk-size-observer"><div class="nk-popup__content"><div class="nk-size-observer"><div class="nk-scrollable nk-scrollable_with-thumb"><div class="nk-scrollable__container" style="max-height: 817px;"><div class="nk-scrollable__content"><div class="nk-size-observer"><div class="nk-map-layers-control-view__layers"><div class="nk-map-layers-control-view__actions"></div></div></div></div></div><!----><!----></div>');
    const listBlock = $("body .nk-portal_edit-tile .nk-map-layers-control-view__layers .nk-map-layers-control-view__actions");
    let is_indoor = mapElement ? mapElement[0].style.zIndex == "195" : false;
    if($(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 195']").length){
      if(is_indoor) mapElement = $(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 195']");
      listBlock.append(`<div class="nk-filter-continer"><p class="nk-filter-title">${text.indoor} <input type="checkbox" id="indoor-checkbox" ${is_indoor ? "checked" : null} /></p></div>`);
      
      const checkbox = listBlock.find("#indoor-checkbox");
      checkbox.on("input", (e) => {
        mapElement = e.target.checked ? $(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 195']") : $(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 150']");
      });
    } else if(is_indoor){
      mapElement = $(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 150']");
    }
    let filterList = [];

    for (const nameFilter in text.fulter) {
      const infoFilter = text.fulter[nameFilter];
      filterList.push(nameFilter + "(" + (infoFilter.default / infoFilter.meaning) + infoFilter.unit + ")");

      listBlock.append('<div class="nk-filter-continer"><p class="nk-filter-title">' + infoFilter['title'] + '</p><div class="nk-filter-block"><input type="range" min="' + infoFilter.min + '" max="' + infoFilter.max + '" value="' + infoFilter.default + '"/></div></div>');
      const input = listBlock.find(".nk-filter-continer:last-child input");

      input.on("input", () => {
        filterList.forEach((filter, id) => {
          if (filter.indexOf(nameFilter) !== -1) {
            filterList[id] = nameFilter + "(" + (input.val() / infoFilter.meaning) + infoFilter.unit + ")";
            return false;
          }
        });

        mapElement.css("filter", filterList.join(" "));
      });
    }

    mapElement.css("filter", filterList.join(" "));

    const element = $(".nk-portal_edit-tile .nk-popup");
    $(document).off("mouseup");
    $(document).mouseup((e) => {
      if (!element.is(e.target) && element.has(e.target).length === 0) {
        $(document).off("mouseup");

        $(".nk-portal_edit-tile .nk-popup").removeClass("nk-popup_visible");
        setTimeout(() => $(".nk-portal_edit-tile").remove(), 300);
      }
    });
  }

  const initTiles = () => {
    const menuBlock = $(".nk-map-left-controls-view");
    const zoomButton = menuBlock.find(".nk-map-zoom-control-view__zoom-out");

    setTimeout(() => {
      mapElement = $(".ymaps-2-1-79-ground-pane ymaps[style*='z-index: 150']");
    }, 1000);

    zoomButton.before('<button aria-disabled="false" class="nk-button nk-button_theme_air nk-button_edit-tiles nk-button_size_xl nk-map-ruler-control-view" aria-pressed="false" type="button"><span class="nk-icon nk-icon_id_ruler nk-icon_align_auto"><svg height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><path d="m14 2c-1 1-2 1-2 1s1 0 2 1 1 2 1 2 0-1 1-2 2-1 2-1-1 0-2-1-1-2-1-2 0 1-1 2z"></path><path d="m5.33334 5.33333c-1.16667 1.16667-2.33333 1.16667-2.33333 1.16667s1.16666 0 2.33333 1.16667c1.16667 1.16666 1.16667 2.33333 1.16667 2.33333s0-1.16667 1.16666-2.33333c1.16667-1.16667 2.33333-1.16667 2.33333-1.16667s-1.16666 0-2.33333-1.16667c-1.16666-1.16666-1.16666-2.33333-1.16666-2.33333s0 1.16667-1.16667 2.33333z"></path><path d="m15 11.5s.8333 0 1.6667-.8333c.8333-.83337.8333-1.6667.8333-1.6667s0 .83333.8334 1.6667c.8333.8333 1.6666.8333 1.6666.8333s-.8333 0-1.6666.8333c-.8334.8334-.8334 1.6667-.8334 1.6667s0-.8333-.8333-1.6667c-.8334-.8333-1.6667-.8333-1.6667-.8333z"></path><path d="m14.3744 9.03991-1.0607 1.06069-1.4142-1.41425 1.0607-1.06066c.1952-.19526.5118-.19526.7071 0l.7071.70711c.1953.19526.1953.51185 0 .70711z"></path><path d="m2.14864 18.4397 9.04376-9.04624 1.4142 1.41424-9.04374 9.0462c-.19526.1953-.51185.1953-.70711 0l-.70711-.7071c-.19526-.1953-.19526-.5118 0-.7071z"></path></svg></span></button>');
    const editTilesButton = menuBlock.find(".nk-button_edit-tiles");

    popupShow(editTilesButton, text.popup)
    editTilesButton.click(showPanel);

    editTilesButton.hover(() => {
      editTilesButton.addClass("nk-button_hovered");
    }, () => {
      editTilesButton.removeClass("nk-button_hovered");
    });
  };

  window.appChrome.init.tiles = initTiles;
})();