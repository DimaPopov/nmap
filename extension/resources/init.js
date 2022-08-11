'use strict';

/**
 * Запускает добавление модулей
 */

(function () {
  const appPage = $(".nk-app-page");

  const hashStart = window.location.href;


  let checkUpdate = true;
  let startStatus = false;
  let setting = {};
  let user = {};
  let update = {};

  let loadCount = 0;

  chrome.storage.local.get(["nkSetting"], (result) => setting = result.nkSetting);


  /* Сообщение об ошибке по умолчанию */
  const defaultError = "Извините, что-то пошло не так";

  /* Заготовки текста */
  const text = {
    getUser: {
      button: "Поиск пользователей",
      view: {
        title: "Поиск пользователей",
        defaultValue: "Для поиска начните вводить логин",
        default: "По запросу ничего не найдено",
        deleteUser: "удалён",
        info: {
          access: "Специальные права",
          createdAt: "Дата регистрации",
          'rating-pos-full': "Место в рейтинге",
          'total-edits': "Число правок",
          'feedback-count': "Разобрано неточности",
          banned: {
            time: "Срок блокировки",
            user: "Модератор",
            reason: "Причина блокировки"
          },
          noCategoryGroup: 'У пользователя нет правок'
        },
      },
      notification: {
        error: {
          default: defaultError
        }
      }
    },
    address: {
      button: "Проверить адреса",
      view: {
        title: "Проверка адресов",
        label: {
          street: "Дорога",
          listAddress: "Номера домов"
        },
        button: {
          cancellation: "Отмена",
          check: "Проверить"
        },
        load: "Идёт проверка",
        row: {
          error: "Не добавленные адреса",
          not_found: "Несуществующие адреса",
          warning: "Адреса с ошибкой"
        },
        default: {
          error: "Все адреса добавлены",
          not_found: "Все адреса существуют",
          warning: "Ошибок в адресах нет"
        }
      },
      notification: {
        success: {
          no_data: "Ошибки в адресах не найдены"
        },
        error: {
          default: defaultError,
          valid: {
            count: "Номера домов должны быть разделены запятыми",
            road: "Номера домов не должны содержать название дороги"
          }
        }
      }
    },
    notificationRegion: {
      checkbox: "Уведомлять о новых правках",
      over20: "более 20 новых правок",
    },
    categories: {
      "rd-group": {
        title: "Дороги",
      },
      "urban-roadnet-group": {
        title: "Дорожная инфрастуктура",
      },
      "cond-group": {
        title: "Условия движения",
      },
      "parking-group": {
        title: "Парковки",
      },
      "urban-group": {
        title: "Территории",
      },
      "bld-group": {
        title: "Здания",
      },
      "indoor-group": {
        title: "Схемы помещений",
      },
      "poi-group": {
        title: "Места",
      },
      "entrance-group": {
        title: "Входы в здание",
      },
      "addr-group": {
        title: "Адреса",
      },
      "fence-group": {
        title: "Заборы",
      },
      "ad-group": {
        title: "Административное деление",
      },
      "vegetation-group": {
        title: "Растительность",
      },
      "relief-group": {
        title: "Рельеф",
      },
      "hydro-group": {
        title: "Гидрография",
      },
      "group-edits": {
        title: "Групповые правки",
      },
      "transport-group": {
        title: "Транспорт",
      },
      "transport-metro-group": {
        title: "Скоростной транспорт",
      },
      "transport-airport-group": {
        title: "Воздушный транспорт",
      },
      "transport-railway-group": {
        title: "Железные дороги",
      },
      "transport-waterway-group": {
        title: "Водный транспорт",
      },
    },
    blocked: {
      button: "Выбрать шаблон",
      portal: {
        title: "Выберите шаблон блокировки",
        pattern: [
          "Игнорирование замечаний",
          "Невозможно связаться с пользователем",
          "Систематические нарушения правил",
          "Ненормативная лексика",
          "Высказывания разжигающие вражду",
          "Вандализм",
          "Дубликат заблокированного профиля"
        ]
      },
      pattern: [
        // Игнорирование замечаний
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы игнорируете замечания модератора и продолжаете допускать ошибки при рисовании карты. Пожалуйста, ответьте мне в [Яндекс.Месседжере](https://yandex.ru/chat#/) и я сниму блокировку досрочно.",
          height: 192,
          term: "Выберите любой срок блокировки, но не более 3 дней"
        },

        // Невозможно связаться с пользователем
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, я не смог связаться с Вами через [Яндекс.Месседжер](https://yandex.ru/chat#/). Пожалуйста, снимите ограничение и напишите мне, после чего я сниму блокировку досрочно.",
          height: 192,
          term: "Рекомендуемый срок блокировки для этой причины — день"
        },

        // Систематические нарушения правил
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы допускаете множество ошибок при рисовании объектов, несмотря на их разъяснение Вам.\n\nПожалуйста, изучите [правила](https://yandex.ru/support/nmaps/) за время блокировки, чтобы в будущем не допускать ошибок.",
          height: 224,
          term: "Выберите любой срок блокировки, но не более 3 дней",
          warning: {
            title: "Желательно указать ссылки на несколько правок с ошибками",
            gaid: "Это нужно, чтобы пользователь лучше понимал, какие ошибки он допускал повторно.\n\nСсылки можно указать после фразы «... несмотря на их разъяснение Вам». На следующей строке можно написать «Вот несколько примеров из них:» и с новой строки указать ссылки на правки с описанием ошибки.\n\nЧтобы причина блокировки имела единый стиль написания, рекомендуеться использовать конструкцию вида:\n— [Краткое описание ошибки](ссылка на правку)"
          }
        },

        // Ненормативная лексика
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование ненормативной лексики в комментариях или профиле. Пожалуйста, пересмотрите свое отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
          height: 212,
          term: "Выберите любой срок блокировки, но не более 3 дней"
        },

        // Высказывания разжигающие вражду
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование высказываний, направленных на возбуждение ненависти либо вражды или на унижение достоинства человека либо группы лиц.\n\nПожалуйста, пересмотрите свое отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
          height: 258,
          term: "Выберите любой срок блокировки, но не более 3 дней"
        },

        // Вандализм
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Ваши правки признаны вандальными, поэтому Ваш профиль заблокирован навсегда.",
          height: 160,
          term: "Рекомендуемый срок блокировки для этой причины — бессрочно"
        },

        // Дубликат заблокированного профиля
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Ваш профиль признан дубликатом другого, заблокированного профиля.",
          height: 160,
          term: "Рекомендуемый срок блокировки для этой причины — бессрочно",
          warning: {
            title: "Желательно указать ссылку на другой профиль этого пользователя",
            gaid: "Это нужно, чтобы при позникновении спорной ситуации было легче найти дубликат профиля.\n\nСсылку можно указать вместо надписи «заблокированного профиля».\n\nЧтобы причина блокировки имела единый стиль написания, рекомендуеться использовать конструкцию вида: [заблокированного профиля](ссылка на профиль)"
          }
        }
      ],
      pattern_end: "\n\nВы всегда можете обжаловать блокировку через [службу поддержки](https://yandex.ru/support/nmaps/troubleshooting/fb_nmaps.html)",
    },
    tiles: {
      popup: "Цветовая коррекция спутниковых тайлов",
      fulter: {
        brightness: {
          title: "Яркость",
          max: 200,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        contrast: {
          title: "Контраст",
          max: 200,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        grayscale: {
          title: "Баланс черного и белого",
          max: 100,
          min: 0,
          meaning: 100,
          default: 0,
          unit: ""
        },
        opacity: {
          title: "Непрозрачность",
          max: 100,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        saturate: {
          title: "Насыщенность",
          max: 1500,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        'hue-rotate': {
          title: "Сдвиг цветов",
          max: 350,
          min: 0,
          meaning: 1,
          default: 0,
          unit: "deg"
        },
        invert: {
          title: "Инверсия цветов",
          max: 100,
          min: 0,
          meaning: 100,
          default: 0,
          unit: ""
        }
      }
    }
  };


  /**
   * Событие клика на кнопку дополнительных инструментов
   */

  const clickToolsButton = () => {
    const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
    toolsButton.off('click', clickToolsButton);

    const toolsMenu = $(".nk-tools-control-view__tools-menu").parent();

    if (startStatus) window.appChrome.init.getUser(toolsMenu);
  };


  /**
   * Создание нового элемента
   *
   * @param parent - Элемент в который нужно добавить новый элемент
   * @param classList - Список классов
   * @param selector - Класс по которому надо найти и вернуть элемент
   * @param text - Текст в элементе
   * @returns {*|jQuery}
   */

  const creatElement = (parent, classList, selector, text = "") => {
    const newElement = document.createElement("div");

    classList.forEach((className) => {
      newElement.classList.add(className);
    });

    newElement.textContent = text;

    $(parent).append(newElement);
    return $(parent).find(selector);
  };


  /**
   * Отображение всплывающей подсказки
   *
   * @param element - Элемент относительно которого нужно показать подсказку
   * @param text - Текст подсказки
   */

  const popupShow = (element, text) => {
    element.hover(() => {
      const popup = $(".nk-portal-local .nk-popup");
      popup.find(".nk-popup__content").text(text);

      const top = element[0].offsetHeight + element.offset().top + 5;
      let left = window.innerWidth - (window.innerWidth - element.offset().left);

      const innerWidth = popup.width() + left;

      if (innerWidth >= window.innerWidth) {
        popup.removeClass("nk-popup_direction_bottom-left");
        popup.addClass("nk-popup_direction_bottom-right");

        left = left - popup.width() + element.width();
      } else {
        popup.removeClass("nk-popup_direction_bottom-right");
        popup.addClass("nk-popup_direction_bottom-left");
      }

      popup.css({"left": left + "px", "top": top + "px"});
      popup.addClass("nk-popup_visible");
    }, () => {
      const popup = $(".nk-portal-local .nk-popup");
      popup.removeClass("nk-popup_visible");
    });
  };


  /**
   * Отслеживание загрузки редактора
   *
   * @type {MutationObserver}
   */

  const loadMap = new MutationObserver(() => {
    loadCount++;

    if (loadCount < 3) return;
    loadMap.disconnect();

    /* Добавим вслплывающие окна */
    $("body").append('<div class="nk-portal nk-portal-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_view_tooltip" style="z-index: 111001;"><div class="nk-size-observer"><div class="nk-popup__content"></div></div></div><!----></div><div class="nk-portal nk-select-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_restrict-height" id="select-status-user"><div class="nk-size-observer"><div class="nk-popup__content"><div class="nk-menu nk-menu_theme_islands nk-menu_mode_check nk-menu_size_m nk-menu_focused nk-select__menu" tabindex="0"><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-menu-item_checked nk-select__option" data-value="all">Все</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="active">Активные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="banned">Заблокированные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="deleted">Удалённые</div></div></div></div></div><!----><!----><!----></div>');

    /* Критическая ошибка - нет токена */
    if (!JSON.parse(localStorage.getItem("nk:token"))) {
      setTimeout(() => {
        window.appChrome.notification("error", "В работе расширения произошла критическая ошибка");
      }, 100);
      return;
    }

    /* Редактор загрузился, теперь ожидаем загрузки дополнительных инструментов, для добавления меню */
    setTimeout(() => {
      if (startStatus) {
        const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
        const getUser = hashStart.indexOf("tools/get-user") !== -1 ? hashStart.replace("#!", "") : false;

        if (!!getUser && setting["get-user"] && startStatus) {
          const url = new URL(getUser);
          const getNameUser = getUser.indexOf("name=") !== -1 ? url.searchParams.get('name') : false;

          window.appChrome.getUser(getNameUser);
        }

        toolsButton.on('click', clickToolsButton);

        if (setting["lock-pattern"]) window.appChrome.init.lockPattern();
      }

      const isAddressCheck = hashStart.indexOf("correct=") !== -1 ? hashStart.replace("#!", "") : false;

      if (!!isAddressCheck && setting["check-address"]) {
        const url = new URL(isAddressCheck);
        const getCorrectName = url.searchParams.get('correct');

        window.appChrome.showCorrect(getCorrectName);
      }

      /* Запускаем модули, которые не зависят от дополнительных инструментов */
      if (setting["check-address"]) window.appChrome.init.address();
      if (setting["get-profile"]) window.appChrome.init.getProfile();
      if (setting["duplicate-addresses"]) window.appChrome.init.addressDuplicate();
      if (setting["tiles"]) window.appChrome.init.tiles();
      if (setting["favorite-objects"]) window.appChrome.init.favoriteObject();
    }, 1);

    window.appChrome.init.eventObject(setting);

    setTimeout(() => {
      /* Показываем уведомление, если во время загрузки произошла ошибка, и модуль сообщил о ней */
      chrome.storage.local.get(["nkApp_sendNotificationTile"], (result) => {
        if (!result.nkApp_sendNotificationTile && window.needNotification.status) {
          window.appChrome.notification(window.needNotification.type, window.needNotification.text);
        }
      });
    }, 1000);

    if (update.needUpdate) {
      const manifest = chrome.runtime.getManifest();
      const v = manifest.version_name;

      const infoVersion = !!update.info.length ? update.info : '<span style="color: var(--nk-name-row-layout__name-type--font-color);">Информации об обновлении нет</span>';

      $("body").append('<div class="nk-portal nk-window-update"><!----><div class="nk-modal nk-modal_theme_islands nk-modal_visible" role="dialog" aria-hidden="false" style="z-index: 10001;"><div class="nk-modal__table"><div class="nk-modal__cell"><div class="nk-modal__content" tabindex="-1"><div class="nk-data-loss-confirmation-view__text nk-section nk-section_level_2"><strong>Доступно обновление расширения</strong><br>Хотите перейти на GitHub, чтобы скачать новую версию?</div><div class="nk-grid nk-sidebar-control nk-section nk-section_level_2 nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Текущая весрия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + v + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Доступная весрия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + update.lastVersion + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Что нового</label></div><div class="nk-grid__col nk-grid__col_span_8">' + infoVersion + '</div></div><div class="nk-form-submit-view nk-form-submit-view_size_l"><button class="nk-button nk-button_theme_islands nk-button_size_l nk-close-window" type="button"><span class="nk-button__text">Напомнить позже</span></button><button class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-button_hovered nk-form-submit-view__submit nk-close-window" type="button"><a class="nk-button__text" style="text-decoration: none;color: inherit;" href="https://github.com/Dmitry-407/nmap/releases/latest" target="_blank">Перейти на GitHub</a></button></div></div></div></div></div><!----><!----><!----></div>');

      $(".nk-close-window").on("click", () => {
        const winodw = $(".nk-window-update .nk-modal.nk-modal_theme_islands");
        winodw.removeClass("nk-modal_visible");

        setTimeout(() => {
          winodw.remove()
        }, 3000);
      });
    }
  });

  const getStartStatus = () => {
    const config = window.appChrome.config;

    const data = [
      {
        "method": "app/getCurrentUser",
        "params": {
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      },
      {
        "method": "app/getCategoriesConfig",
        "params": {
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      }
    ];

    $.ajax({
      type: "POST",
      headers: {
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        user = response.data[0].data;
        window.appChrome.configGet = response.data[1].data;

        startStatus = user.yandex || user.outsourcer || user.moderationStatus === "moderator";

        window.appChrome.user = user;
        window.appChrome.startStatus = startStatus;

        if (checkUpdate) {
          chrome.runtime.sendMessage({method: "checkUpdate", id: user.id}, function (response) {
            update = response;
          });

          checkUpdate = false;
        }
      }
    });

    setTimeout(getStartStatus, 30000);
  };

  $.ajax({
    url: "https://n.maps.yandex.ru/",
    type: "GET",
    success: function(data) {
      const response = new DOMParser().parseFromString(data, "text/html");
      const config = JSON.parse(response.getElementById("config").innerHTML);

      window.appChrome.config = config;
      loadMap.observe(appPage[0], {childList: true});

      if (JSON.parse(localStorage.getItem("nk:token"))) {
        getStartStatus();
      }
    }
  });

  ////////////////////

  window.appChrome = {
    init: {},
    notification: null,
    text: text,
    creatElement: creatElement,
    popupShow: popupShow,
    user: user,
    startStatus: startStatus,
    configGet: {},
    config: {}
  };

  window.needNotification = {
    status: false
  };
})();