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

  let initFrMosRu = false;

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
          'feedback-count': "Разобрано неточностей",
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
          listAddress: "Список адресов"
        },
        button: {
          cancellation: "Отмена",
          check: "Проверить"
        },
        load: "Идёт проверка",
        row: {
          error: "Недобавленные адреса",
          not_found: "Адресов нет в списке",
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
            road: "Номера домов в списке не должны содержать название дороги"
          }
        }
      }
    },
    categories: {
      "rd-group": {
        title: "Дороги",
      },
      "urban-roadnet-group": {
        title: "Дорожная инфраструктура",
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
          "Высказывания, разжигающие вражду",
          "Вандализм",
          "Дубликат заблокированного профиля"
        ]
      },
      pattern: [
        // Игнорирование замечаний
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, Вы игнорируете замечания модератора и продолжаете допускать ошибки при рисовании карты. Пожалуйста, ответьте мне в [Яндекс.Мессенджере](https://yandex.ru/chat#/) и я сниму блокировку досрочно.",
          height: 192,
          term: "Выберите любой срок блокировки, но не более 3 дней"
        },

                // Невозможно связаться с пользователем
        {
          text: "Добрый день, {user_name}!\n\nК сожалению, я не смог связаться с Вами через [Яндекс.Мессенджер](https://yandex.ru/chat#/). Пожалуйста, снимите ограничение и напишите мне, после чего я сниму блокировку досрочно.",
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
            gaid: "Это нужно, чтобы пользователь лучше понимал, какие ошибки он допускал повторно.\n\nСсылки можно указать после фразы «... несмотря на их разъяснение Вам». На следующей строке можно написать «Вот несколько примеров из них:» и с новой строки указать ссылки на правки с описанием ошибки.\n\nЧтобы причина блокировки имела единый стиль написания, рекомендуется использовать конструкцию вида:\n— [Краткое описание ошибки](ссылка на правку)"
          }
        },

        // Ненормативная лексика
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование ненормативной лексики в комментариях или профиле. Пожалуйста, пересмотрите своё отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
          height: 212,
          term: "Выберите любой срок блокировки, но не более 3 дней"
        },

        // Высказывания разжигающие вражду
        {
          text: "Добрый день, {user_name}!\n\nВ Народной карте запрещено использование высказываний, направленных на возбуждение ненависти либо вражды или на унижение достоинства человека либо группы лиц.\n\nПожалуйста, пересмотрите своё отношение к картографии и за время блокировки изучите [правила](https://yandex.ru/support/nmaps/)",
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
            gaid: "Это нужно, чтобы при возникновении спорной ситуации было легче найти дубликат профиля.\n\nСсылку можно указать вместо надписи «заблокированного профиля».\n\nЧтобы причина блокировки имела единый стиль написания, рекомендуется использовать конструкцию вида: [заблокированного профиля](ссылка на профиль)"
          }
        }
      ],
      pattern_end: "\n\nВы всегда можете обжаловать блокировку через [службу поддержки](https://yandex.ru/support/nmaps/troubleshooting/fb_nmaps.html)",
    },
    tiles: {
      popup: "Цветовая коррекция спутниковых тайлов",
      indoor: "Применить к схеме",
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
          title: "Баланс чёрного и белого",
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
    },
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

      let top = element[0].offsetHeight + element.offset().top + 5;
      let left = window.innerWidth - (window.innerWidth - element.offset().left);

      const innerWidth = popup.width() + left;
      const innerHeight = popup.height() + top;

      if (innerWidth >= window.innerWidth) {
        popup.removeClass("nk-popup_direction_bottom-left nk-popup_direction_top-left nk-popup_direction_top-right");
        popup.addClass("nk-popup_direction_bottom-right");

        left = left - popup.width() + element.width();
      } else {
        popup.removeClass("nk-popup_direction_bottom-right nk-popup_direction_top-right nk-popup_direction_top-left");
        popup.addClass("nk-popup_direction_bottom-left");
      }

      if (innerHeight >= window.innerHeight) {
        top = top - popup.height() - element.height() - 10;

        if (popup.hasClass("nk-popup_direction_bottom-right")) {
          popup.removeClass("nk-popup_direction_bottom-right");
          popup.addClass("nk-popup_direction_top-right");
        }else {
          popup.removeClass("nk-popup_direction_bottom-left");
          popup.addClass("nk-popup_direction_top-left");
        }
      }

      popup.css({"left": left + "px", "top": top + "px"});
      popup.addClass("nk-popup_visible");
    }, () => {
      const popup = $(".nk-portal-local .nk-popup");
      popup.removeClass("nk-popup_visible");
    });
  };


  /**
   * Симуляция нажатия
   * @param node - Node-элемент на который нужно симулировать нажатие
   * @param eventType - Вид симулируемого события
   */

  const triggerMouseEvent = (node, eventType) => {
    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  };


  /**
   * Вызывает необходимые события для симуляции нажатия
   * @param element - Элемент на который нужно симулировать нажатие
   */

  const triggerClick = (element) => {
    triggerMouseEvent(element[0], "mouseover");
    triggerMouseEvent(element[0], "mousedown");
    triggerMouseEvent(element[0], "mouseup");
    triggerMouseEvent(element[0], "click");
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

    /* Добавим всплывающие окна */
    $("body").append('<div class="nk-portal nk-portal-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_view_tooltip" style="z-index: 111001;"><div class="nk-size-observer"><div class="nk-popup__content"></div></div></div><!----></div><div class="nk-portal nk-select-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_restrict-height" id="select-status-user"><div class="nk-size-observer"><div class="nk-popup__content"><div class="nk-menu nk-menu_theme_islands nk-menu_mode_check nk-menu_size_m nk-menu_focused nk-select__menu" tabindex="0"><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-menu-item_checked nk-select__option" data-value="all">Все</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="active">Активные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="banned">Заблокированные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="deleted">Удалённые</div></div></div></div></div><!----><!----><!----></div>');

    /* Критическая ошибка - нет токена */
    if (!JSON.parse(localStorage.getItem("nk:token"))) {
      setTimeout(() => {
        window.appChrome.notification("error", "В работе расширения произошла критическая ошибка");
      }, 100);
      return;
    }

    /* Ждем клика по аватарке */
    $(".nk-user-bar-view__user-icon").on('click', () => {
      setTimeout(() => {
        const parent = $(".nk-user-bar-view__name + .nk-menu .nk-menu__group:first-of-type");
        const id = chrome.runtime.id;

        if(!parent.find('div[data-link="chrome-extension://' + id + '/index.html"]').length){
          parent.append('<div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_l" data-link="chrome-extension://' + id + '/index.html" tabindex="-1">Настройки</div>');
          const button = parent.find('div[data-link="chrome-extension://' + id + '/index.html"]');

          button.hover(() => {
            button.addClass("nk-menu-item_hovered");
          }, () => {
            button.removeClass("nk-menu-item_hovered");
          });

          button.on("click", () => {
            chrome.runtime.sendMessage({method: "openSetting"});
          });
        }
      }, 10);
    });


    /* Редактор загрузился, теперь ожидаем загрузки дополнительных инструментов для добавления меню */
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
      if (setting["check-address"]) window.appChrome.init.addressCheck();
      if (setting["get-profile"]) window.appChrome.init.getProfile();
      if (setting["duplicate-addresses"]) window.appChrome.init.addressDuplicate();
      if (setting["tiles"]) window.appChrome.init.tiles();
      if (setting["favorite-objects"]) window.appChrome.init.favoriteObject();
      if (setting["open-service"]) window.appChrome.init.openService();
      if (setting["address"]) window.appChrome.init.address();

      if (setting["fr_mos_ru"] && !initFrMosRu) {
        initFrMosRu = true;

        /* Получение данных из фонда реновации */
        $.ajax({
          type: "POST",
          headers: {
            'content-type': 'text/plain;charset=UTF-8',
          },
          url: setting["fr_mos_ru_api"],
          data: JSON.stringify({ token: setting["fr_mos_ru_token"], login: window.appChrome.user.login }),
          success: (response) => {
            if (response?.objects?.items) {
              const items = response.objects.items.map((item) => {
                const itemNew = Object.assign(item);

                itemNew.name_orign = item.name;
                itemNew.name = item.name
                  .replace(/ ?ул\. ?/gm, " улица ")
                  .replace(/ ?пер\. ?/gm, " переулок ")
                  .replace(/ ?ш\. ?/gm, " шоссе ")
                  .replace(/ ?пл\. ?/gm, " площадь ")
                  .replace(/ ?б-р ?/gm, " бульвар ")
                  .replace(/ ?пр-кт ?/gm, " проспект ")
                  .replace(/ ?пр-д ?/gm, " проезд ")
                  .replace(/,? (д\.|дом) /gm, ", ")
                  .replace(/,? (к\.|корп\.|корпус) /gm, "к")
                  .replace(/,? (с\.|стр\.|строение) /gm, "c")
                  .replace(/,? (влд\.|вл\.|з\/у) /gm, "вл")
                  .replaceAll("улица вл", "улица, вл")
                  .replaceAll("проспект вл", "проспект, вл")
                  .replaceAll("проезд вл", "проезд, вл")
                  .replaceAll("шоссе вл", "шоссе, вл")
                  .replaceAll("бульвар вл", "бульвар, вл")
                  .replaceAll(" ,", ",")
                  .trim();

                return itemNew;
              });

              const street = [];

              items.forEach((item) => {
                const streetItem = item.name.split(",")[0].toLowerCase();

                if (!street[streetItem]) street[streetItem] = { items: [], address: [] };

                street[streetItem].address.push(item.name);
                street[streetItem].items.push(item);
              });

              const address = items.map((item) => item.name);

              window.fr_mos_ru = {
                items: items,
                street: street,
                address: address
              };
            }else {
              if (window.appChrome.notification) {
                window.appChrome.notification("error", "Не удалось получить информацию от Фонда реновации");
              }else {
                window.needNotification = {
                  status: true,
                  type: "error",
                  text: "Не удалось получить информацию от Фонда реновации"
                };
              }
            }
          },
          error: () => {
            if (window.appChrome.notification) {
              window.appChrome.notification("error", "Не удалось подключиться к серверу данных от Фонда реновации");
            }else {
              window.needNotification = {
                status: true,
                type: "error",
                text: "Не удалось подключиться к серверу данных от Фонда реновации"
              };
            }
          }
        });
      }
    }, 1);

    window.appChrome.init.eventObject(setting);

    setTimeout(() => {
      /* Показываем уведомление, если во время загрузки произошла ошибка, и модуль сообщил о ней */
      if (window.needNotification.status) {
        window.appChrome.notification(window.needNotification.type, window.needNotification.text);
      }
    }, 1000);

    if (update.needUpdate) {
      const manifest = chrome.runtime.getManifest();
      const v = manifest.version_name;

      const infoVersion = !!update.info.length ? update.info : '<span style="color: var(--nk-name-row-layout__name-type--font-color);">Информации об обновлении нет</span>';

      $("body").append('<div class="nk-portal nk-window-update"><!----><div class="nk-modal nk-modal_theme_islands nk-modal_visible" role="dialog" aria-hidden="false" style="z-index: 10001;"><div class="nk-modal__table"><div class="nk-modal__cell"><div class="nk-modal__content" tabindex="-1"><div class="nk-data-loss-confirmation-view__text nk-section nk-section_level_2"><strong>Доступно обновление расширения</strong><br>Хотите перейти на GitHub, чтобы скачать новую версию?</div><div class="nk-grid nk-sidebar-control nk-section nk-section_level_2 nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Текущая версия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + v + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Доступная версия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + update.lastVersion + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Что нового</label></div><div class="nk-grid__col nk-grid__col_span_8">' + infoVersion + '</div></div><div class="nk-form-submit-view nk-form-submit-view_size_l"><button class="nk-button nk-button_theme_islands nk-button_size_l nk-close-window" type="button"><span class="nk-button__text">Напомнить позже</span></button><button class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-button_hovered nk-form-submit-view__submit nk-close-window" type="button"><a class="nk-button__text" style="text-decoration: none;color: inherit;" href="https://github.com/Dmitry-407/nmap/releases/latest" target="_blank">Перейти на GitHub</a></button></div></div></div></div></div><!----><!----><!----></div>');

      $(".nk-close-window").on("click", () => {
        const winodw = $(".nk-window-update .nk-modal.nk-modal_theme_islands");
        winodw.removeClass("nk-modal_visible");

        setTimeout(() => {
          winodw.remove()
        }, 3000);
      });
    }
  });

  const getExpertise = (publicID) => {
    const config = window.appChrome.config;

    const data = [
      {
        "method": "social/getUserExpertise",
        "params": {
          "userPublicId": publicID,
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      }
    ];

    $.ajax({
      type: "POST",
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        user.expertise = response.data[0].data;
        window.appChrome.user = user;
      }
    });
  };

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
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        user = response.data[0].data;
        window.appChrome.configGet = response.data[1].data;

        getExpertise(user.publicId);

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
    url: window.location.origin,
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

  const getStatusCategory = (data) => {
    let cat_name = '&mdash;';

    let status_code = data.status_code ? data.status_code.toLowerCase() : '';
    let info_center = "";

    let color = status_code == 'processing' ? 'orange' :
      status_code == 'finished' ? 'green-light' :
        status_code == 'old' ? 'green' :
          status_code == 'confirmed' ? 'red' :
            status_code == 'kvartal' ? 'kvartal' :
              status_code == 'start' ? 'red' : '';

    if (data.status_code === 'PROCESSING') {
      cat_name = 'Новый дом';
      data.status_text = 'Строится';
    }
    if (data.status_code === 'FINISHED') {
      cat_name = 'Новый дом';
      data.status_text = 'Введён в&nbsp;эксплуатацию';
    }
    if (data.status_code === 'START') {
      cat_name = 'Новый дом';
      data.status_text = 'Стартовая площадка';
    }
    if (data.status_code === 'KVARTAL') {
      cat_name = 'Новый дом';
      data.status_text = 'Объекты квартальной застройки';
    }

    if (data.status_code === 'OLD') {
      cat_name = 'Дом, включённый в Программу реновации';

      if (data.ext_status === 'settling') {
        data.status_text = 'Идёт переселение';
      } else if (data.ext_status === 'settled') {
        data.status_text = 'Переселение дома завершено';
      } else if (data.ext_status === 'destroyed') {
        data.status_text = 'Переселение дома завершено.\n Дом снесён';
      } else {
        data.status_text = 'Переселение ещё не началось';
      }

      data.status = 'Введен в эксплуатацию';

      if (data.ext_status == 'settling') {
        if (data.infocenter) {
          info_center = 'Переселение дома производится в&nbsp;Информационном центре по&nbsp;адресу: ' + data.infocenter.name + (data.infocenter2 ? '\n' + data.infocenter2.name : '');
        }else {
          info_center = 'Информационный центр по&nbsp;переселению дома закрыт. По&nbsp;вопросу завершения переселения Вы можете обратиться в&nbsp;префектуру административного округа.';
        }
      }else if (data.ext_status == 'settled') {
        info_center = 'Переселение дома завершено.';
      }else if (data.ext_status == 'destroyed') {
        info_center = 'Переселение дома завершено. Дом снесён.';
      }else {
        info_center = 'Переселение дома ещё не&nbsp;началось. Адрес Информационного центра будет опубликован в&nbsp;день старта переселения.';
      }
    }

    return {
      color: color,
      status: data.status,
      status_text: data.status_text,
      cat_name: cat_name,
      info_center: info_center
    };
  };

  ////////////////////

  window.appChrome = {
    init: {},
    notification: null,
    text: text,
    user: user,
    startStatus: startStatus,
    configGet: {},
    config: {},
    creatElement: creatElement,
    popupShow: popupShow,
    triggerClick: triggerClick,
    getStatusCategory: getStatusCategory
  };

  window.needNotification = {
    status: false
  };
})();
