'use strict';

/**
* Запускает добавление модулей
*/

(function () {
  const appPage = $(".nk-app-page");
  
  const URL_API = "core-sat.maps.yandex.net";
  const hashStart = window.location.href;

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
          createdAt: "Дата регистрации",
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
    }
  };
  
  let url = {
    tile: {
      getServices: "https://" + URL_API + "/get.services",
      deleteCash: "https://" + URL_API + "/delete.cash",
      editServices: "https://" + URL_API + "/edit.services"
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
   * Отслеживание загрузки редактора
   *
   * @type {MutationObserver}
   */
  
  const loadMap = new MutationObserver(() => {
    loadMap.disconnect();
    
    /* Редактор загрузился, теперь ожидаем загрузки дополнительных инструментов, для добавления меню */
    setTimeout(() => {
      const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
      const nameUser = hashStart.indexOf("tools/get-user") !== -1 ? hashStart.replace("#!", "") : false;
      const isAddressCheck = hashStart.indexOf("correct=") !== -1 ? hashStart.replace("#!", "") : false;
    
      if (!!nameUser) {
        const url = new URL(nameUser);
        const getNameUser = nameUser.indexOf("name=") !== -1 ? url.searchParams.get('name') : false;

        window.appChrome.getUser(getNameUser);
      }
      
      if (!!isAddressCheck) {
        const url = new URL(isAddressCheck);
        const getCorrectName = url.searchParams.get('correct');
        
        window.appChrome.showCorrect(getCorrectName);
      }
      
      window.appChrome.init.address();
      toolsButton.on('click', clickToolsButton);
      
      /* Запускаем модули, которые не зависят от дополнительных инструментов */
      window.appChrome.init.getProfile();
    }, 1);
    
    /* Показываем уведомление, если во время загрузки произошла ошибка, и модуль сообщил о ней */
    chrome.storage.local.get(["nkApp_sendNotificationTile"], (result) => {       
      if (!result.nkApp_sendNotificationTile && window.needNotification.status) {
        window.appChrome.notification(window.needNotification.type, window.needNotification.text);
      }
    });
  });
    
  loadMap.observe(appPage[0], {childList: true});
  
  
  ////////////////////
  
  window.appChrome = {
    init: {},
    api: {
      url: url,
    },
    notification: null,
    text: text,
    creatElement: creatElement
  };

  window.needNotification = {
    status: false
  };
})();