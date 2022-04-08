'use strict';

/**
 * Запускает добавление модулей
 */

(function () {
  const appPage = $(".nk-app-page");

  const hashStart = window.location.href;

  let setting = {};
  let startStatus = false;
  let config = {};
  let user = {};

  chrome.storage.local.get(["nkSetting"], (result) => {
    if (!result.nkSetting) {
      const default_setting = {
        'get-user': true,
        'get-profile': true,
        'check-address': true,
        'notification': true,
        'q-link': false,
      };

      chrome.storage.local.set({ "nkSetting": default_setting });
      setting = default_setting;
    }else {
      setting = result.nkSetting;
    }
  });

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
          yndx: "Должность",
          createdAt: "Дата регистрации",
          'rating-pos-full': "Место в рейтинге",
          'total-edits': "Число правок",
          'feedback-count': "Разобрано неточности",
          delete: {
            yndx: {
              time: "Уволил",
              info: "Причина увольнения"
            },
            user: {
              time: "Удалил",
              info: "Причина удаления"
            }
          },
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
          "Дубликат заблокированного профиля",
          "Временная блокировка для исправления ошибок"
        ]
      },
      pattern: [
        // Игнорирование замечаний
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы игнорируете замечания модератора и продолжаете допускать ошибки при рисовании карты. Пожалуйста, ответьте мне в [Яндекс.Месседжере](https://yandex.ru/chat#/) и я сниму блокировку досрочно.",
          height: 192,
          term: "2 дня"
        },

        // Невозможно связаться с пользователем
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, я не смог связаться с Вами через [Яндекс.Месседжер](https://yandex.ru/chat#/). Пожалуйста, снимите ограничение и напишите мне, после чего я сниму блокировку досрочно.",
          height: 192,
          term: "день"
        },

        // Систематические нарушения правил
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы допускаете множество ошибок при рисовании объектов, несмотря на их разъяснение Вам.\n\nПожалуйста, изучите [правила](https://yandex.ru/support/nmaps/) за время блокировки, чтобы в будущем не допускать ошибок.",
          height: 224,
          term: "3 дня"
        },

        // Ненормативная лексика
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование ненормативной лексики. Пожалуйста, пересмотрите свое отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
          height: 192,
          term: "3 дня"
        },

        // Высказывания разжигающие вражду
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование высказываний, направленных на возбуждение ненависти либо вражды или на унижение достоинства человека либо группы лиц.\n\nПожалуйста, пересмотрите свое отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
          height: 258,
          term: "3 дня"
        },

        // Вандализм
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Ваши правки признаны вандальными, поэтому Ваш профиль заблокирован навсегда.",
          height: 160,
          term: "бессрочно"
        },

        // Дубликат заблокированного профиля
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Ваш профиль признан дубликатом другого, заблокированного профиля.",
          height: 160,
          term: "бессрочно"
        },

        // Временная блокировка для исправления ошибок
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы отрисовали множество объектов, которые содержат критичные ошибки. При этом, Вы не даете их исправить, поэтому Ваш профиль временно заблокирован. Как только допущенные ошибки будут исправлены, блокировка будет снята",
          height: 208,
          term: "день"
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
    const popup = $(".nk-portal-local .nk-popup");
    popup.find(".nk-popup__content").text(text);

    const top = element[0].offsetHeight + element.offset().top + 5;
    let left = window.innerWidth - (window.innerWidth - element.offset().left);

    setTimeout(() => {
      const innerWidth = popup.width() + left;

      if (innerWidth >= window.innerWidth) {
        popup.removeClass("nk-popup_direction_bottom-left");
        popup.addClass("nk-popup_direction_bottom-right");

        left = left - popup.width() + element.width();
      } else {
        popup.removeClass("nk-popup_direction_bottom-right");
        popup.addClass("nk-popup_direction_bottom-left");
      }

      setTimeout(() => {
        popup.css({"left": left + "px", "top": top + "px"});
        popup.addClass("nk-popup_visible");
      }, 1);
    }, 1);
  };


  /**
   * Отслеживание загрузки редактора
   *
   * @type {MutationObserver}
   */

  const loadMap = new MutationObserver(() => {
    loadMap.disconnect();

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
      if (setting["duplicate-addresses"]) window.appChrome.init.addressDuplicate();
      if (setting["notification"]) window.appChrome.init.notificationRegion();
      if (setting["get-profile"]) window.appChrome.init.getProfile();
      if (setting["tiles"]) window.appChrome.init.tiles();
      if (setting["poi"]) window.appChrome.init.poi();
      if (setting["parking"]) window.appChrome.init.parking();
      if (setting["vegetation"]) window.appChrome.init.vegetation();
    }, 1);

    setTimeout(() => {
      /* Показываем уведомление, если во время загрузки произошла ошибка, и модуль сообщил о ней */
      chrome.storage.local.get(["nkApp_sendNotificationTile"], (result) => {
        if (!result.nkApp_sendNotificationTile && window.needNotification.status) {
          window.appChrome.notification(window.needNotification.type, window.needNotification.text);
        }
      });
    }, 1000);
  });

  loadMap.observe(appPage[0], {childList: true});

  const getStartStatus = () => {
    config = JSON.parse(document.querySelector("#config").innerHTML);

    const data = [
      {
        "method": "app/getCurrentUser",
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

        startStatus = user.yandex || user.outsourcer || user.moderationStatus === "moderator";

        window.appChrome.user = user;
        window.appChrome.startStatus = startStatus;
      }
    });

    setTimeout(getStartStatus, 30000);
  };

  if (JSON.parse(localStorage.getItem("nk:token"))) {
    getStartStatus();
  }

  ////////////////////

  window.appChrome = {
    init: {},
    notification: null,
    text: text,
    creatElement: creatElement,
    popupShow: popupShow,
    user: user,
    startStatus: startStatus
  };

  window.needNotification = {
    status: false
  };
})();