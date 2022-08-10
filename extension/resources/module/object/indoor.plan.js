'use strict';

/**
 * Добавляет возможность отобразить информацию о том, включена ли публикация схемы
 */

(function () {
  /**
   * Отображение информации
   */

  const render = (info) => {
    if (info.attrs["sys:not_operating"]) return;

    let sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-scrollable__content .nk-size-observer > div");
    sectionsElement.append('<div class="nk-section nk-section_level_2 nk-vegetation-system"><div class="nk-indoor_plan-system nk-control-only-layout nk-boolean-text-control nk-form__control"><span class="nk-boolean-text-control__value">Отображается в Яндекс.Картах</span></div></div>');
  };


  /**
   * Подписываемся на получение уведомления об открытии схемы помещения
   */

  window.appChrome.eventObect.append({
    title: ['Схема помещений'],
    category: "indoor_plan",
    check: () => {
      const indoorPlanObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-indoor_plan-system");

      return indoorPlanObject[0];
    },
    render: render
  });
})();