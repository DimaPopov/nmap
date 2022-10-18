'use strict';

/**
 * Добавляет возможность отобразить информацию о детальном отображении парков
 */

(function () {
  /**
   * Отображение информации
   */

  const render = (info) => {
    if (!info.attrs["vegetation:is_detailed"] && info.attrs["vegetation:disp_class"] !== "8") return;

    let sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-scrollable__content .nk-size-observer > div > .nk-section.nk-form");
    let sectionElement = $(sectionsElement[0]);

    sectionElement.after('<div class="nk-section nk-section_level_2 nk-vegetation-system"><div class="nk-vegetation-system nk-control-only-layout nk-boolean-text-control nk-form__control"><span class="nk-boolean-text-control__value">Детальное отображение</span><span class="nk-icon nk-icon_id_help-small nk-icon_align_auto nk-system__info-icon"><svg xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd" transform="scale(0.7) translate(5, 5)"><path d="M11 21c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm0-1.8c4.529 0 8.2-3.671 8.2-8.2s-3.671-8.2-8.2-8.2-8.2 3.671-8.2 8.2 3.671 8.2 8.2 8.2zM10.885 6.048c.956 0 1.751.229 2.384.686.633.457.949 1.134.949 2.031 0 .55-.138 1.014-.413 1.39-.161.229-.47.521-.927.876l-.451.349c-.245.19-.408.413-.489.667-.051.161-.078.41-.083.749h-1.714c.025-.715.093-1.209.203-1.482.11-.273.394-.587.851-.943l.463-.362c.152-.114.275-.239.368-.375.169-.233.254-.489.254-.768 0-.322-.094-.615-.282-.879-.188-.264-.532-.397-1.031-.397-.491 0-.839.163-1.044.489-.205.326-.308.664-.308 1.016h-1.834c.051-1.206.472-2.061 1.263-2.564.499-.322 1.113-.482 1.841-.482zM10 14h2v2h-2v-2z"></path></g></svg></span></div></div>');

    popupShow($(".nk-vegetation-system .nk-icon_id_help-small"), "Для этого парка включено детальное отображение растительности");
  };

  /**
   * Подписываемся на получение уведомления об открытии объекта растительности
   */

  window.appChrome.eventObect.append({
    title: ['Растительность', 'Vegetation'],
    category: "vegetation",
    check: () => {
      const vegetationObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-vegetation-system");

      return vegetationObject[0];
    },
    render: render
  });
})();
