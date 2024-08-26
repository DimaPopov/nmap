'use strict';

/**
 * Добавляет возможность отобразить информацию о точках пересечения
 */

(function () {
  const icons_access = window.appChrome.text.road_access;
  const popupShow = window.appChrome.popupShow;


  /**
   * Отображение информации
   */

  const render = (info) => {
    let hasDiff = false;
    let { start, end } = info.masters;

    const attrs = window.appChrome.configGet.attrs;

    if (start && end) {
      if (start?.geoObjects?.length > 1 || end?.geoObjects?.length > 1) return;

      start = start.geoObjects[0];
      end = end.geoObjects[0];
    }else if (end) {
      if (end.geoObjects?.length > 2) return;

      start = end.geoObjects[0];
      end = end.geoObjects[1];
    }else {
      return;
    }

    Object.keys(start.attrs).forEach((attr_name) => {
      const attr_start = start.attrs[attr_name];
      const attr_end = end.attrs[attr_name];

      if (attr_start !== attr_end) hasDiff = true;
    });

    Object.keys(end.attrs).forEach((attr_name) => {
      const attr_start = start.attrs[attr_name];
      const attr_end = end.attrs[attr_name];

      if (attr_start !== attr_end) hasDiff = true;
    });

    if (hasDiff && !$("#note_rd_jc")[0]) {
      const sections = $(".nk-sidebar-view.nk-geoobject-viewer-view .nk-scrollable__content .nk-size-observer > div");
      sections.prepend('<div id="note_rd_jc" class="nk-poi-conflicts-viewer-view nk-rd_jc-conflicts nk-section nk-section_level_2"><div class="nk-poi-conflicts-viewer-view__header">Конфликт атрибутов</div><div class="nk-rd_jc_confilcts_list">У участок дорог есть различия в атрибутах, поэтому эту точку пересечения нельзя удалить. Если видимых отличий между атрибутами нет и точка пересечения лишняя — оставьте сообщение об ошибке</div></div>');
    }
  };


  /**
   * Подписываемся на получение уведомления об открытии объекта растительности
   */

  window.appChrome.eventObect.append({
    title: ['Пересечение дорог'],
    category: "rd_jc",
    check: () => {
      const note = $("#note_rd_jc");
      if (!localStorage.getItem("nk-appChrome-start")) return;

      return note[0];
    },
    render: render
  });
})();