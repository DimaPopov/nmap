'use strict';

/**
 * Запускает добавление модулей
 */

(function () {
  const appPage = $(".nk-app-page");

  const hashStart = window.location.href;
  let setting = {};

  chrome.storage.local.get(["nkSetting"], (result) => {
    if (!result.nkSetting) {
      const default_setting = {
        'get-user': true,
        'get-profile': true,
        'check-address': true,
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
        deleteYndx: "уволен",
        info: {
          access: "Специальные права",
          yndx: "Должность",
          createdAt: "Дата регистрации",
          'rating-pos-full': "Место в рейтинге",
          'total-edits': "Число правок",
          'feedback-count': "Разобранно неточности",
          delete: {
            yndx: {
              time: "Уволил",
              info: "Причина увольнения"
            },
            user: {
              time: "Удалил",
              info: "Причина удаления"
            }
          }
        },
        filter: {
          role: {
            title: "По правам",
            showAll: "Показать все права",
            hideAll: "Скрыть список прав"
          }
        },
        role: {
          moderator: "Модератор",
          notModerator: "Права модератора в этом слое недоступны",
          expert: "Эксперт"
        }
      },
      notification: {
        error: {
          default: defaultError
        }
      },
      deleteReason: {
        'passport': "Удалён в Яндекс.ID",
        'yndx-registration': "yndx-логин без соответствующих прав",
        'spammer': "Спамер (по версии Яндекс.ID)",
        'suspicious': "Подозрительная деятельность",
        'inactive-outsourcer': "Аутсорсер не проявлял активность",
        'ddos': "Большое количество запросов",
        'user': "Удалён в ручном режиме",
        'unknown' : "Причина неизвестна"
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
        title: "Скоростной тарнспорт",
      },
      "transport-airport-group": {
        title: "Воздушный тарнспорт",
      },
      "transport-railway-group": {
        title: "Желензные дороги",
      },
      "transport-waterway-group": {
        title: "Водный тарнспорт",
      },
    }
  };


  /**
   * Событие клика на кнопку дополнительных инструментов
   */

  const clickToolsButton = () => {
    const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
    toolsButton.off('click', clickToolsButton);

    const toolsMenu = $(".nk-tools-control-view__tools-menu").parent();

    window.appChrome.init.getUser(toolsMenu);
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

    /* Редактор загрузился, теперь ожидаем загрузки дополнительных инструментов, для добавления меню */
    setTimeout(() => {
      const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
      const getUser = hashStart.indexOf("tools/get-user") !== -1 ? hashStart.replace("#!", "") : false;
      const isAddressCheck = hashStart.indexOf("correct=") !== -1 ? hashStart.replace("#!", "") : false;

      if (!!getUser && setting["get-user"]) {
        const url = new URL(getUser);
        const getNameUser = getUser.indexOf("name=") !== -1 ? url.searchParams.get('name') : false;

        window.appChrome.getUser(getNameUser);
      }

      if (!!isAddressCheck && setting["check-address"]) {
        const url = new URL(isAddressCheck);
        const getCorrectName = url.searchParams.get('correct');

        window.appChrome.showCorrect(getCorrectName);
      }

      toolsButton.on('click', clickToolsButton);

      /* Запускаем модули, которые не зависят от дополнительных инструментов */
      if (setting["check-address"]) window.appChrome.init.address();
      if (setting["get-profile"]) window.appChrome.init.getProfile();
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


  ////////////////////

  window.appChrome = {
    init: {},
    notification: null,
    text: text,
    creatElement: creatElement,
    popupShow: popupShow
  };

  window.needNotification = {
    status: false
  };
})();