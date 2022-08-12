'use strict';

/**
 * Добавляет возможность отобразить информацию о дорогах
 */

(function () {
  const kindsValue = ["auto", "bus", "tram", "bike"];
  const kindsInfo = {
    "auto": {
      "title": "автомобили",
      "icon": '<svg height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><g><path clip-rule="evenodd" d="m17.2002 18.6071v-3.9394c0-.2808-.0457-.552-.1304-.8058l-1.0871-4.18794c-.2089-.80498-.8855-1.39622-1.7016-1.48708-1.1192-.12459-1.6962-.18688-3.281-.18688-1.58483 0-2.16181.06229-3.28096.18688-.81613.09086-1.49269.6821-1.70164 1.48708l-1.08706 4.18794c-.08471.2537-.13043.525-.13042.8058v3.9394c0 .217.17349.3929.38751.3929h1.63497c.17781 0 .33281-.1227.37593-.2976l.31413-1.2738h6.97514l.3141 1.2738c.0431.1749.1981.2976.3759.2976h1.635c.214 0 .3875-.1759.3875-.3929zm-3.2555-9.42809c.4836.07002.9094.41558 1.0367.90599l.6679 2.3936c-.2465-.1328-.7955-.256-1.086-.297-1.194-.1687-2.0296-.253-3.5632-.253-1.53357 0-2.36885.0843-3.56289.253-.29044.041-.84061.1642-1.08717.297l.66791-2.3936c.12731-.49041.55313-.83597 1.03674-.90599 1.08833-.15758 1.38694-.18219 2.94541-.18219 1.5585 0 1.8563.02461 2.9446.18219zm1.318 6.67809c.642 0 1.1625-.5276 1.1625-1.1785s-.5205-1.1786-1.1625-1.1786c-.6421 0-1.1626.5277-1.1626 1.1786s.5205 1.1785 1.1626 1.1785zm-7.36264-1.1785c0 .6509-.52047 1.1785-1.16251 1.1785s-1.16252-.5276-1.16252-1.1785.52048-1.1786 1.16252-1.1786 1.16251.5277 1.16251 1.1786z" fill-rule="evenodd"></path><path d="m18.3625 11.1429c.214 0 .3875.1758.3875.3928v.3204c0 .3994-.2956.7353-.687.7807l-.3315.0384c-.1932.0224-.3728-.1038-.42-.2951l-.1847-.7491c-.0611-.248.1238-.4881.3759-.4881z"></path><path d="m3.63751 11.1429c-.21402 0-.38751.1758-.38751.3928v.3204c0 .3994.29558.7353.687.7806l.33174.0385c.19316.0224.37277-.1038.41993-.2951l.18473-.7491c.06114-.248-.12374-.4881-.37584-.4881z"></path></g></svg>'
    },
    "bus": {
      "title": "автобусная полоса",
      "icon": '<svg height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m17.125 11.125v7.4375c0 .2416-.1959.4375-.4375.4375h-1.8459c-.2008 0-.3758-.1366-.4244-.3314l-.3547-1.4186h-6.125l-.35465 1.4186c-.04869.1948-.22369.3314-.42444.3314h-1.84591c-.24162 0-.4375-.1959-.4375-.4375v-7.4375l-.63316-.3166c-.14821-.0741-.24184-.2256-.24184-.3913v-1.9171c0-.48325.39175-.875.875-.875v-.53558c0-.75828.48835-1.43029 1.20957-1.66446.89983-.29216 2.51384-.42496 4.91543-.42496 2.4016 0 4.0156.1328 4.9154.42496.7212.23417 1.2096.90618 1.2096 1.66446v.53558c.4832 0 .875.39175.875.875v1.9171c0 .1657-.0936.3172-.2418.3913zm-6.125-4.375c-1.97221 0-3.46549.20857-4.47985.6257-.30903.12708-.51868.41909-.54034.75252l-.22981 3.53718c0 .2158.15741.3994.37072.4323.71119.1099 2.33762.1648 4.87928.1648 2.5416 0 4.1681-.0549 4.8793-.1647.2133-.033.3707-.2166.3707-.4324l-.2298-3.53721c-.0217-.33344-.2314-.62543-.5404-.75251-1.0144-.41712-2.5076-.62568-4.4798-.62568zm3.9375 9.625c.7249 0 1.3125-.5876 1.3125-1.3125s-.5876-1.3125-1.3125-1.3125-1.3125.5876-1.3125 1.3125.5876 1.3125 1.3125 1.3125zm-7.875 0c.72487 0 1.3125-.5876 1.3125-1.3125s-.58763-1.3125-1.3125-1.3125-1.3125.5876-1.3125 1.3125.58763 1.3125 1.3125 1.3125z" fill-rule="evenodd"></path></svg>'
    },
    "tram": {
      "title": "трамвайные пути",
      "icon": '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.5l.5.5 1-1h1.5v2c-1.8 0-2.5.7-3 1.7-.25.456-1 2.31-1 4.269v5.031h2.3l-2 2h1.7l2-2h4l2 2h1.7l-2-2h2.3v-5c0-2-.75-3.8-1-4.3-.5-1-1.3-1.7-3-1.7v-2h1.5l1 1 .5-.5s-1.356-1.5-1.5-1.5h-7l-1.5 1.5zm6 1.5h-2v-2h2v2zm-6 8h2v2h-2v-2zm8 0h2v2h-2v-2zm-2-7v1h-2v-1h2zm-5 2h8l1 4h-10l1-4z"></path></svg>'
    },
    "bike": {
      "title": "велосипедная полоса",
      "icon": '<svg height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m7.78137 10.9062-.7942.2647c-.39296.131-.8177-.0813-.94868-.4743-.02549-.0765-.03849-.1566-.03849-.2372v-.49794c0-.33432.03481-.45555.10017-.57778.06537-.12222.16129-.21814.28351-.28351.12223-.06536.24346-.10017.57778-.10017h2.16354c.34518 0 .625.27982.625.625v.00583c0 .14443-.02058.26567-.06279.37097-.04221.1052-.10605.1938-.19256.2671-.08652.0734-.19503.1312-.33204.1769l-.17125.0571 1.89774 3.3004 2.7655-4.60902-.4835-1.20855c-.0569-.14237-.1948-.23573-.3481-.23573h-1.198c-.3452 0-.625-.27982-.625-.625s.2798-.625.625-.625h1.198c.6644 0 1.262.40455 1.5087 1.02149l2.0939 5.23481c.066-.0042.1324-.0063.1994-.0063 1.7259 0 3.125 1.3991 3.125 3.125s-1.3991 3.125-3.125 3.125-3.125-1.3991-3.125-3.125c0-1.2173.696-2.272 1.7117-2.7879l-.974-2.4351-2.5694 4.2824c.1394.1725.2424.3788.2947.6098.0246.1086.037.2195.037.3308 0 .8273-.6706 1.4979-1.4979 1.4979-.1113 0-.2223-.0124-.3308-.0369l-4.43056-1.0032c-.21389-.0484-.36574-.2385-.36574-.4578s.15185-.4094.36574-.4578l4.10059-.9284zm.19456 3.2359-1.37758.3119c-.32837-.2829-.75588-.454-1.22335-.454-1.03553 0-1.875.8395-1.875 1.875s.83947 1.875 1.875 1.875c.46747 0 .89498-.1711 1.22335-.454l1.37758.3119c-.5603.8393-1.51606 1.3921-2.60093 1.3921-1.72589 0-3.125-1.3991-3.125-3.125s1.39911-3.125 3.125-3.125c1.08487 0 2.04063.5528 2.60093 1.3921zm10.52407 1.7329c0 1.0355-.8395 1.875-1.875 1.875s-1.875-.8395-1.875-1.875.8395-1.875 1.875-1.875 1.875.8395 1.875 1.875z" fill-rule="evenodd"></path></svg>'
    }
  }

  const lanePattern = window.appChrome.text.road;
  const popupShow = window.appChrome.popupShow;

  const infoIcon = '<span class="nk-icon nk-icon_id_help-small nk-icon_align_auto nk-system__info-icon"><svg xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd" transform="scale(0.7) translate(5, 5)"><path d="M11 21c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm0-1.8c4.529 0 8.2-3.671 8.2-8.2s-3.671-8.2-8.2-8.2-8.2 3.671-8.2 8.2 3.671 8.2 8.2 8.2zM10.885 6.048c.956 0 1.751.229 2.384.686.633.457.949 1.134.949 2.031 0 .55-.138 1.014-.413 1.39-.161.229-.47.521-.927.876l-.451.349c-.245.19-.408.413-.489.667-.051.161-.078.41-.083.749h-1.714c.025-.715.093-1.209.203-1.482.11-.273.394-.587.851-.943l.463-.362c.152-.114.275-.239.368-.375.169-.233.254-.489.254-.768 0-.322-.094-.615-.282-.879-.188-.264-.532-.397-1.031-.397-.491 0-.839.163-1.044.489-.205.326-.308.664-.308 1.016h-1.834c.051-1.206.472-2.061 1.263-2.564.499-.322 1.113-.482 1.841-.482zM10 14h2v2h-2v-2z"></path></g></svg></span>';

  /**
   * Генерирует таблицу полос
   *
   * @param element - Элемент, в который нужно добавить таблицу полос
   * @param attr_name - Название атрибута
   * @param lanes - Информация о полосах
   */

  const renderLane = (element, attr_name, lanes) => {
    /* Добавим информацию о том, к какой точке относятся эти манёвры */
    element.append('<div class="nk-grid nk-sidebar-control nk-section nk-section_level_2 nk-geoobject-relations-view"><div class="nk-grid__col nk-grid__col_span_4"><label class="nk-sidebar-control__label">' + window.appChrome.configGet.attrs[attr_name].label + '</label></div><div class="nk-grid__col nk-grid__col_span_8"><table class="nk-lanes-view"><tbody><tr class="nk-lanes-view__row nk-lanes-view__lanes-numbers"></tr><tr class="nk-lanes-view__row nk-lanes-view__lanes-directions"></tr></tbody></table></div></div>');

    const laneView = element.find("div:last-child .nk-grid__col_span_8 .nk-lanes-view");
    const numberLanes = laneView.find(".nk-lanes-view__lanes-numbers");

    /* Определим максимальное число манёвров и колличество полос */
    const sortLanes = (lane_1, lane_2) => {
      return (lane_1.length > lane_2.length) ? lane_1 : lane_2;
    }

    const maxCountManeuvers = lanes.reduce(sortLanes).split(":")[0].split(",").length;
    const countLanes = lanes.length;


    /* Генерируем таблицу с полосами */
    let kindsLane = [];

    lanes.forEach((lane, id) => {
      /* Добавим номер полосы */
      const numberLane = countLanes - id;
      numberLanes.append('<td class="nk-lanes-view__cell">' + numberLane + '</td>');

      /* Если эта полоса не для автомобилей, то сохраним эту информацию для вывода в будущем */
      const kinds = lane.split(":")[1];
      if (kinds !== kindsValue[0]) kindsLane[id] = kinds;

      /* Добавим информацию о доступных манёврых */
      const maneuvers = lane.split(":")[0].split(",");
      maneuvers.forEach((maneuver, lane_ID) => {
        let activeDirections = laneView.find(".nk-lanes-view__lanes-directions:nth-child(" + (lane_ID + 2) + ")");

        /* Если нет строчки для этого манёвра, создадим её */
        if (!activeDirections[0]) {
          laneView.append('<tr class="nk-lanes-view__row nk-lanes-view__lanes-directions"></tr>');
          activeDirections = laneView.find(".nk-lanes-view__lanes-directions:nth-child(" + (lane_ID + 2) + ")");
        }

        /* Проверим пустая ли полоса */
        if (maneuver === "N") {
          activeDirections.append('<td class="nk-lanes-view__cell"></td>');
          return;
        }

        /* Добавим манёвр в полосу */
        const nameManeuver = maneuver.toLowerCase();
        const pattren = lanePattern[nameManeuver];

        activeDirections.append('<td class="nk-lanes-view__cell nk-last-append-chrome"><span class="nk-icon nk-icon_id_dir-' + nameManeuver + ' nk-icon_align_auto nk-lanes-view__direction">' + pattren.icon + '</span></td>');

        const element = activeDirections.find(".nk-last-append-chrome");
        element.removeClass('nk-last-append-chrome');

        popupShow(element.find(".nk-icon"), pattren.title);
      });


      /* Если манёвров не максимальное колличество, то добавим пустые ячейки */
      for (let i = maneuvers.length; i < maxCountManeuvers; i++) {
        let activeDirections = laneView.find(".nk-lanes-view__lanes-directions:nth-child(" + (i + 2) + ")");

        if (!activeDirections[0]) {
          laneView.append('<tr class="nk-lanes-view__row nk-lanes-view__lanes-directions"></tr>');
          activeDirections = laneView.find(".nk-lanes-view__lanes-directions:nth-child(" + (i + 2) + ")");
        }

        activeDirections.append('<td class="nk-lanes-view__cell"></td>');
      }
    });
  };


  /**
   * Добавление информации о связи с манёврами
   *
   * @param maneuvers - Манёвры
   */

  const renderMasterManeuvers = (maneuvers) => {
    const sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-scrollable__content .nk-size-observer > div > .nk-section.nk-form");
    let sectionElement = $(sectionsElement[sectionsElement.length - 1]);

    sectionElement.before('<div class="nk-section nk-grid nk-sidebar-control nk-geoobject-relations-view nk-lanes-section"><div class="nk-grid__col nk-grid__col_span_4"><label class="nk-sidebar-control__label">Косвенная связь с манёврами' + infoIcon + '</label></div><div class="nk-grid__col nk-grid__col_span_8"><div class="nk-geoobject-relations-view__item nk-lanes-view"></div></div></div>');

    const icon = $(".nk-lanes-section .nk-system__info-icon");
    popupShow(icon, "На этот участок дороги ссылаются настройки манёвров по полосам");

    const laneInfo = $(".nk-lanes-view");

    maneuvers.forEach((maneuver) => {
      const nameManeuver = maneuver.split(" ")[0];
      const laneNumber = maneuver.replace(nameManeuver + " ", "");

      laneInfo.append('<div class="nk-bottom-chrome">' + lanePattern[nameManeuver.toLowerCase()].title + ' ' + laneNumber +  '</div>');
    });
  };


  /**
   * Проверка необходимости отображения информации о направлениях движения по полосам
   */

  const checkRenderLane = (info, sectionElement) => {
    const f_lane = info.attrs["rd_el:f_lane"];
    const t_lane = info.attrs["rd_el:t_lane"];

    /* Направление движения по полосам */
    if (!f_lane && !t_lane) {
      if (info.masters && info.masters.to) {
        const master = info.masters.to.geoObjects;
        let renderStatus = false;
        let maneuvers = [];

        master.forEach((object) => {
          if (object.categoryId == "cond_lane") {
            maneuvers.push(object.title.replace("{{attr-values:cond_lane-lane__", "").replace("}}", ""));
            renderStatus = true;
          }
        });

        if (renderStatus) {
          renderMasterManeuvers(maneuvers);
        }
      }
    }else {
      /* Для этого участка привязаны манёвры по полосам */
      sectionElement.before('<div class="nk-section nk-section_level_2 nk-lanes-section"></div>');
      const element = sectionElement.parent().find(".nk-lanes-section");

      /* Добавим блок для информаций о движении по полосам */
      if (f_lane) renderLane(element, "rd_el:f_lane", f_lane.split(";"));
      if (t_lane) renderLane(element, "rd_el:t_lane", t_lane.split(";"));
    }
  } ;


  /**
   * Отображение информации
   */

  const render = (info) => {
    const sectionsElement = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-scrollable__content .nk-size-observer > div > .nk-section.nk-form");
    const sectionElement = $(sectionsElement[sectionsElement.length - 1]);

    checkRenderLane(info, sectionElement);

    /* Двойная сплошная */
    if (info.attrs["rd_el:dr"]) {
      sectionElement.find("> .nk-form__group").prepend('<div class="nk-control-only-layout nk-boolean-text-control nk-form__control nk-dr-control"><span class="nk-boolean-text-control__value">' + window.appChrome.configGet.attrs["rd_el:dr"].label + '</span></div>');
    }
  };


  /**
   * Подписываемся на получение уведомления об открытии объекта растительности
   */

  window.appChrome.eventObect.append({
    title: ['Участок дороги', 'Section of road'],
    category: "rd_el",
    check: () => {
      const lanesObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-lanes-view");
      return lanesObject[0];
    },
    render: render
  });
})();