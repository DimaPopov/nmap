'use strict';

/**
* Добавляет возможность проверить соответствие адресов согласно данным введенным пользователем
*/

(function () {
  /* Магические значения, необходимые для корректного отображения интерфейса */

  const MAGIC_HEIGHT = 218;
  const MAGIC_TOP_WINDOW = 180;
  const MAGIC_LEFT_CLOSE = MAGIC_TOP_WINDOW - 55;

  const rep = {
    ST: 'с',
    KO: 'к',
    SO: 'соор',
    VL: 'вл',
    KV: 'кв'
  };

  let activeObject = false;
  let config = window.appChrome.config;

  let settingCheckAddress = {};

  let typeObject = "";
  let objectID = 0;
  let nameRoad = "";
  
  const text = window.appChrome.text.address;
  const creatElement = window.appChrome.creatElement;
  
  
  /**
   * Скрытие окна проверки адресов
   */

  /* Удалим окно поиска */
  const hideView = () => {    
    $(".nk-portal-local").remove();
    activeObject = false;
    
    $(".nk-address-check").remove();
    $(".nk-geoobject-viewer-view[style='display: none']").removeAttr("style");
    
    objectID = 0;
    activeObject = false;

    /* Покажем окно дороги */
    const objectViewElement = $(".nk-geoobject-viewer-view");
    objectViewElement.css("display", "unset");
  };


  /**
   * Скрытие окна при нажатии Escape
   * @param e
   */

  const hideViewKeyup = (e) => {     
    if (e.key === "Escape") {
      hideView();
    }
  };


  /**
   * Возвращает строку адресов введенных пользователем в соответствии с правилами
   *
   * @param textarea - Поле для ввода, в котором введены адреса
   * @returns {string} - Адреса, отформатированные в соответствии с правилами
   */
  
  const getUserAddress = (textarea) => {
    const value = " " + textarea.val();

    return value
      .replace(/\n|\r|(зд|до)\D+|зд|г\S+?ж/gi, "")
      .replace(/\/+|\\+/g,"/")
      .replace(/(\d+|\,|$)/g," $1")
      .replace(/(кв)(\S+|)\s+(\d+)/gi,"kv$3")
      .replace(/(к\S+)\s+(\d+)/gi,"ko$2")
      .replace(/(со\S+)\s+(\d+)/gi,"so$2")
      .replace(/(с)(\S+|)\s+(\d+)/gi,"st$3")
      .replace(/(в\S+)\s+(\d+)/gi,"vl$2")
      .replace(/\s+/g,"").toUpperCase()
      .replace(/(ST|KO|SO|VL|KV)/g,f=>rep[f])
      .trim();
  };


  /**
   * Генерация результата проверки
   *
   * @param addressArray - Список адресов, которые нанесены на карту
   */
  
  const renderCheckAddress = (addressArray) => {
    /* Отформатируем списки адресов */
    const userAddress = getUserAddress($(".nk-address-check .nk-text-area .nk-text-area__control")).split(",");
    let yanedxAddress = [];
        
    addressArray.forEach((address) => {
      /* Приведем вид адресов к единому стилю */

      if (typeObject === "Дорога") {
        yanedxAddress.push({
          id: address.id,
          title: address.title
        });
      }else {
        const addressYanedxList = address.title.split(", ");

        yanedxAddress.push({
          id: address.id,
          title: addressYanedxList.length > 1 ? addressYanedxList[1] + " (" + addressYanedxList[0] + ")" : address.title
        });
      }
    });

    let errorAddress = [];
    let warningAddress = [];
    
    userAddress.forEach((addressNumber) => {
      const address_comma = nameRoad + ", " + addressNumber.trim();
      const address_bracket = addressNumber.trim() + " (" + nameRoad + ")";
      const address = typeObject === "Дорога" ? address_comma : address_bracket;

      let check = false;
      
      yanedxAddress.forEach((yanedx, id) => {
        /* Адрес совпал, ошибки нет */
        if (address === yanedx.title) {
          yanedxAddress.splice(id, 1);
          check = true;
          
        /* Адрес в Яндексе похож на введенный адрес, добавим предупреждение */
        }else if (address.indexOf(yanedx.title) !== -1 && address.length == yanedx.title.length) {
          warningAddress.push({
            id: yanedx.id,
            title: {
              user: address,
              yanedx: yanedx.title
            }
          });
          
          yanedxAddress.splice(id, 1);
          check = true;
        }
      });
      
      
      /* Адрес не найден, значит он не существует */
      if (!check) {
        errorAddress.push({
          id: 0,
          title: {
            user: address
          }
        });        
      }
    });
    
    let notFoundAddress = yanedxAddress;
    
    /* ---- Проверка завершена ---- */
    
    /* Если ошибок нет, то скрыть окно и показать уведомление */
    if (!errorAddress.length && !warningAddress.length && !notFoundAddress.length) {
      window.appChrome.notification("success", text.notification.success.no_data);
      hideView();

      return;
    }


    /* Если есть ошибки, начинаем генерацию окна ошибок */
    
    let elementsView = {
      parent: $(".nk-address-check .nk-island"),
      element: $(".nk-address-check .nk-island .nk-section.nk-section_level_1:last-child")
    }; 
    
    elementsView.element.html("");
        
    elementsView.parent = creatElement(elementsView.parent, ["nk-scrollable", "nk-scrollable_has-scroll", "nk-scrollable_with-thumb", "nk-section", "nk-section_level_1"], ".nk-scrollable_with-thumb");
    elementsView.scrollableContainer = creatElement(elementsView.parent, ["nk-scrollable__container"], ".nk-scrollable__container");
    elementsView.scrollableContainer.css("max-height", window.innerHeight - MAGIC_HEIGHT + "px");

    // Контейнер
    elementsView.scrollableContainer = creatElement(elementsView.scrollableContainer, ["nk-scrollable__content"], ".nk-scrollable__content");
    elementsView.content = creatElement(elementsView.scrollableContainer, ["nk-size-observer"], ".nk-size-observer");

    elementsView.parent = creatElement(elementsView.content, ["nk-form", "nk-section", "nk-section_level_2", "nk-address-section"], ".nk-address-section");
        
    /* Добавим разделение на тип ошибки */
        
    // Адрес не добавлен
    elementsView.parentError = creatElement(elementsView.parent, ["nk-grid", "nk-sidebar-control", "nk-section", "nk-section_level_2", "nk-geoobject-relations-view", "nk-list-address", "nk-list-address_error"], ".nk-list-address_error");
    elementsView.titleError = creatElement(elementsView.parentError, ["nk-grid__col", "nk-grid__col_span_4"], ".nk-grid__col_span_4");
    elementsView.titleLabelError = creatElement(elementsView.titleError, ["nk-sidebar-control__label"], ".nk-sidebar-control__label", text.view.row.error);

    elementsView.contentError = creatElement(elementsView.parentError, ["nk-grid__col", "nk-grid__col_span_8"], ".nk-grid__col_span_8");

    let lastID = 0;

    if (!!errorAddress.length) {
      errorAddress.forEach((address) => {
        let addressElement = creatElement(elementsView.contentError, ["nk-name-row-layout__name-type", "nk-address"], ".nk-address:last-child");
        const title = address.title.user.indexOf(", ") !== -1 ? address.title.user.split(", ")[1] : address.title.user.split(" ")[0];
        lastID++;

        addressElement = creatElement(addressElement, ["nk-text-control__text", "nk-address-portal"], ".nk-text-control__text", title);
        addressElement.attr("data-nk-address-user", address.title.user);
      });
    }else {          
      const addressDefaultErrorElement = creatElement(elementsView.contentError, ["nk-name-row-layout__name-type", "nk-no-address"], ".nk-no-address");
      creatElement(addressDefaultErrorElement, ["nk-keyed-text-control__text"], ".nk-keyed-text-control__text", text.view.default.error);
      elementsView.parentError.removeClass("nk-list-address");
    }
        
        
    // Адрес не существует
    elementsView.parentNotFount = creatElement(elementsView.parent, ["nk-grid", "nk-sidebar-control", "nk-section", "nk-section_level_2", "nk-geoobject-relations-view", "nk-list-address", "nk-list-address_not-found"], ".nk-list-address_not-found");
    elementsView.titleNotFount = creatElement(elementsView.parentNotFount, ["nk-grid__col", "nk-grid__col_span_4"], ".nk-grid__col_span_4");
    elementsView.titleLabeNotFount = creatElement(elementsView.titleNotFount, ["nk-sidebar-control__label"], ".nk-sidebar-control__label", text.view.row.not_found);


    elementsView.contentNotFount = creatElement(elementsView.parentNotFount, ["nk-grid__col", "nk-grid__col_span_8"], ".nk-grid__col_span_8");

    if (!!notFoundAddress.length) {
      notFoundAddress.forEach((address) => {
        let addressElement = creatElement(elementsView.contentNotFount, ["nk-geoobject-relations-view__item", "nk-address"], ".nk-address:last-child");
        const title = address.title.indexOf(", ") !== -1 ? address.title.split(", ")[1] : address.title.split(" ")[0];
        lastID++;

        addressElement.html('<a role="link" class="nk-link nk-link_theme_islands nk-geoobject-link-view nk-geoobject-link-view_with-preview nk-address-portal" href="/#!/objects/' + address.id + '/edit">' + title + '</a>');
        addressElement = addressElement.find(".nk-address-portal");

        addressElement.attr("data-nk-address-yandex", address.title);
      });
    }else {   
      const addressDefaultNotFountElement = creatElement(elementsView.contentNotFount, ["nk-name-row-layout__name-type", "nk-no-address"], ".nk-no-address");
      creatElement(addressDefaultNotFountElement, ["nk-keyed-text-control__text"], ".nk-keyed-text-control__text", text.view.default.not_found);
      elementsView.parentNotFount.removeClass("nk-list-address");
    }
        
        
    // Адрес содержит ошибку
    elementsView.parentWarning = creatElement(elementsView.parent, ["nk-grid", "nk-sidebar-control", "nk-section", "nk-section_level_2", "nk-geoobject-relations-view", "nk-list-address", "nk-list-address_warning"], ".nk-list-address_warning");
    elementsView.titleWarning = creatElement(elementsView.parentWarning, ["nk-grid__col", "nk-grid__col_span_4"], ".nk-grid__col_span_4");
    elementsView.titleLabelWarning = creatElement(elementsView.titleWarning, ["nk-sidebar-control__label"], ".nk-sidebar-control__label", text.view.row.warning);


    elementsView.contentWarning = creatElement(elementsView.parentWarning, ["nk-grid__col", "nk-grid__col_span_8", "nk-grid"], ".nk-grid__col_span_8");

    if (!!warningAddress.length) {
      warningAddress.forEach((address) => {
        let addressElement = creatElement(elementsView.contentWarning, ["nk-geoobject-relations-view__item", "nk-name-row-layout__name-type", "nk-address"], ".nk-address:last-child");
        const title = address.title.yanedx.indexOf(", ") !== -1 ? address.title.yanedx.split(", ")[1] : address.title.yanedx.split(" ")[0];
        lastID++;

        addressElement.html('<a role="link" class="nk-link nk-link_theme_islands nk-geoobject-link-view nk-geoobject-link-view_with-preview nk-address-portal" href="/#!/objects/' + address.id + '/edit?correct=' + address.title.user + '" target="_blank">' + title + '</a>');
        addressElement = addressElement.find(".nk-address-portal");

        addressElement.attr("data-nk-address-user", address.title.user);
        addressElement.attr("data-nk-address-yandex", address.title.yanedx);
      });
    }else {   
      const addressDefaultWarningElement = creatElement(elementsView.contentWarning, ["nk-name-row-layout__name-type", "nk-no-address"], ".nk-no-address");
      creatElement(addressDefaultWarningElement, ["nk-keyed-text-control__text"], ".nk-keyed-text-control__text", text.view.default.warning);
      elementsView.parentWarning.removeClass("nk-list-address");
    }

    /* Добавим всплывающие окна при наведении на номер дома */
    const portalAddress = elementsView.parent.find(".nk-address-portal");
    const popup = $(".nk-portal-local .nk-popup");

    portalAddress.hover((e) => {
      const element = $(e.delegateTarget);
      const popupContent = popup.find(".nk-popup__content");

      const dataUser = element.attr("data-nk-address-user");
      const dataYandex = element.attr("data-nk-address-yandex");

      if (dataUser && dataYandex) {
        popupContent.html("Текущий адрес — <strong>" + dataYandex + "</strong><br/>Предполагаемый адрес — <strong>" + dataUser +"</strong>");
      }else {
        popupContent.text(dataUser ? dataUser : dataYandex);
      }

      const top = element[0].offsetHeight + element.offset().top + 3;
      let left = window.innerWidth - (window.innerWidth - element.offset().left);

      const innerWidth = popup.width() + left;

      if (innerWidth >= window.innerWidth) {
        popup.removeClass("nk-popup_direction_top-left");
        popup.addClass("nk-popup_direction_bottom-right");

        left = left - popup.width() + element.width();
      }else {
        popup.removeClass("nk-popup_direction_bottom-right");
        popup.addClass("nk-popup_direction_top-left");
      }

      popup.css({ "left": left + "px", "top": top });
      popup.addClass("nk-popup_visible");
    }, () => {
      popup.removeClass("nk-popup_visible");
    });
  };
  
  
  /**
  * Получение данных адресов
  */
  
  const checkAddress = () => {
    const buttonElement = $(".nk-address-check .nk-form-submit-view");
    const textAreaElement = $(".nk-address-check .nk-text-area");

    /* Проверим данные на корректность */
    const value = textAreaElement.find(".nk-text-area__control");
    
    if (getUserAddress(value).indexOf(nameRoad) !== -1) {
      window.appChrome.notification("warning", text.notification.error.valid.road);
      return;
    }
    
    if (getUserAddress(value).split(",")[0].length > 5) {
      window.appChrome.notification("warning", text.notification.error.valid.count);
      return;
    }
    
    /* Отключим возможность взаимодействия с формой и начнем проверку данных */
    textAreaElement.addClass("nk-text-area_disabled");
    textAreaElement.find(".nk-text-area__control").attr("disabled", "true");

    buttonElement.addClass("nk-confirmation-view_view_dark");
    buttonElement.html('<div class="nk-load-status-button"><span class="nk-spinner nk-spinner_theme_islands nk-spinner_size_m"></span><span class="nk-form-submit-view__progress-label">' + text.view.load + '</span></div>');
    
    const data = [
        {
          "method": "editor/getGeoObjectSlaves",
          "params": {
            "id": objectID,
            "branch": "0",
            "limit": 10000,
            "categoryId": "addr",
            "roleId": typeObject === "Дорога" ? "associated_with" : "addr_associated_with",
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
      url: "https://n.maps.yandex.ru/" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        const slaves = response.data[0].data.slaves;
        renderCheckAddress(slaves);
      },
      error: function () {
        /* Произошла ошибка, покажем уведомление и вернем доступность форме */
        window.appChrome.notification("error", text.notification.error.default);

        textAreaElement.removeClass("nk-text-area_disabled");
        textAreaElement.find(".nk-text-area__control").removeAttr("disabled");

        buttonElement.removeClass("nk-confirmation-view_view_dark");
        buttonElement.html('<button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_l nk-cancellation" type="button"><span class="nk-button__text">' + text.view.button.cancellation + '</span></button><button aria-disabled="true" class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-form-submit-view__submit" type="button"><span class="nk-button__text">' + text.view.button.check + '</span></button>');

        const buttonElements = buttonElement.find("button");

        buttonElements.hover((e) => {
          const element = $(e.delegateTarget);

          if (!!element.attr("disabled")) return;
          element.addClass("nk-button_hovered");
        }, (e) => {
          const element = $(e.delegateTarget);

          element.removeClass("nk-button_hovered nk-button_pressed");
        });

        buttonElements.mousedown((e) => {
          const element = $(e.delegateTarget);

          if (!!element.attr("disabled")) return;
          element.addClass("nk-button_pressed");
        });

        const buttonSubmit = buttonElement.find(".nk-form-submit-view__submit");

        buttonSubmit.off("click", checkAddress);
        buttonSubmit.on("click", checkAddress);
      }
    });
  };
  
  
  /**
  * Открытие окна проверки адресов
  */

  const showCheckAddress = () => {
    objectID = window.location.hash.split("objects/")[1].split("?")[0];

    /* Поиск необходимых элементов */
    const popup = $(".nk-portal-local .nk-popup");
    const objectViewElement = $(".nk-geoobject-viewer-view");
    
    nameRoad = objectViewElement.find(".nk-name-row-layout__name .nk-text-control__text span").text();
    const location = objectViewElement.find(".nk-grid.nk-sidebar-control.nk-section.nk-section_level_2.nk-geoobject-relations-view .nk-grid__col.nk-grid__col_span_8 .nk-geoobject-relations-view__item .nk-geoobject-link-view").text().replace("город ", "");
    
    /* Скроем окно дороги */
    objectViewElement.css("display", "none");

    /* Создание нового окна */
    const newViewElement = document.createElement("aside");
    
    newViewElement.classList.add("nk-sidebar-view");
    newViewElement.classList.add("nk-geoobject-viewer-view");
    newViewElement.classList.add("nk-address-check");
        
    objectViewElement.after(newViewElement);
    
    let elementsView = {};
    
    elementsView.nkSizeObserver = creatElement(newViewElement, ["nk-size-observer"], ".nk-size-observer");
    elementsView.nkIsland = creatElement(elementsView.nkSizeObserver, ["nk-island"], ".nk-island");
    
    /* Добавление заголовка окна */      
    elementsView.titleElement = {};
    
    elementsView.titleElement.parent = creatElement(elementsView.nkIsland, ["nk-sidebar-header-view", "nk-grid", "nk-section", "nk-section_level_1"], ".nk-sidebar-header-view");
        
    elementsView.titleElement.col = creatElement(elementsView.titleElement.parent, ["nk-grid__col"], ".nk-grid__col");
    
    elementsView.titleElement.titleCentered = creatElement(elementsView.titleElement.parent, ["nk-sidebar-header-view__title", "nk-sidebar-header-view__title_centered", "nk-grid__col", "nk-grid__col_span_10"], ".nk-sidebar-header-view__title_centered");
    elementsView.titleElement.nkSidebarHeaderView_titleText = creatElement(elementsView.titleElement.titleCentered, ["nk-sidebar-header-view__title-text"], ".nk-sidebar-header-view__title-text", text.view.title);
        

    elementsView.titleElement.colClose = creatElement(elementsView.titleElement.parent, ["nk-sidebar-header-view__close", "nk-grid__col"], ".nk-sidebar-header-view__close");
    elementsView.titleElement.colClose.html('<!----><span class="nk-icon nk-icon_id_close nk-icon_align_auto nk-icon_interactive nk-icon_close"><svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="m9.58579 11-5.43934-5.43934c-.19527-.19526-.19527-.51184 0-.70711l.7071-.7071c.19527-.19527.51185-.19527.70711 0l5.43934 5.43934 5.4393-5.43934c.1953-.19527.5119-.19527.7071 0l.7072.7071c.1952.19527.1952.51185 0 .70711l-5.4394 5.43934 5.4394 5.4393c.1952.1953.1952.5119 0 .7071l-.7072.7072c-.1952.1952-.5118.1952-.7071 0l-5.4393-5.4394-5.43934 5.4394c-.19526.1952-.51184.1952-.70711 0l-.7071-.7072c-.19527-.1952-.19527-.5118 0-.7071z"></path></svg></span><!---->');
        
    elementsView.titleElement.colClose.find(".nk-icon_close").on("click", hideView);
    elementsView.titleElement.colClose.hover(() => {      
      popup.css({ "left": window.innerWidth - MAGIC_LEFT_CLOSE + "px", "top": "105px" });
      popup.find(".nk-popup__content").text("Закрыть (Esc)");
      popup.addClass("nk-popup_visible");
    }, () => {
      popup.removeClass("nk-popup_visible");
    });
    
    document.addEventListener("keyup", hideViewKeyup);
        
    /* Добавим содержимое окна */
    
    elementsView.form = {};
    
    elementsView.form.home = creatElement(elementsView.nkIsland, ["nk-section", "nk-section_level_1"], ".nk-section:last-child");
    elementsView.form.home.append("<form class='nk-form nk-section nk-section_level_1'></form>");
    
    elementsView.form.parent = elementsView.form.home.find(".nk-form");    
    
    /* Идентификатор и название объекта */
    elementsView.form.block = creatElement(elementsView.form.parent, ["nk-grid", "nk-text-input-control", "nk-form__control"], ".nk-form__control:last-child");
    
    elementsView.form.block_title = creatElement(elementsView.form.block, ["nk-grid__col", "nk-grid__col_span_4"], ".nk-grid__col_span_4");
    elementsView.form.block_title.html('<p class="nk-form-control__label">' + text.view.label.street + '</p>');
    
    elementsView.form.block_text = creatElement(elementsView.form.block, ["nk-grid__col", "nk-grid__col_span_8"], ".nk-grid__col_span_8");
    
    elementsView.form.block_text_name = creatElement(elementsView.form.block_text, ["nk-name-row-layout__name"], ".nk-name-row-layout__name");
    elementsView.form.block_text_name = creatElement(elementsView.form.block_text_name, ["nk-text-control__text"], ".nk-text-control__text", location + ", " + nameRoad);

    elementsView.form.block_text_object = creatElement(elementsView.form.block_text, ["nk-name-row-layout__name-type"], ".nk-name-row-layout__name-type");
    elementsView.form.block_text_object = creatElement(elementsView.form.block_text_object, ["nk-keyed-text-control__text"], ".nk-keyed-text-control__text", objectID);

    if (settingCheckAddress["link-yandex"]) {
      /* Добавление перехода поиска в Яндексе */
      elementsView.form.block_text_object.append('<a role="link" class="nk-link nk-link_theme_islands" href="https://yandex.ru/search/?text='+ location + '+' + nameRoad +'" target="_blank" style="margin-left: 10px;">Яндекс</a>');
    }

    if (settingCheckAddress["link-google"]) {
      /* Добавление перехода поиска в Google */
      elementsView.form.block_text_object.append('<a role="link" class="nk-link nk-link_theme_islands" href="https://www.google.com/search?client=ms-google-coop&q='+ location + '+' + nameRoad +'" target="_blank" style="margin-left: 10px;">Google</a>');
    }

    /* Поле для ввода списка адресов */
    elementsView.form.block = creatElement(elementsView.form.parent, ["nk-grid", "nk-text-input-control", "nk-form__control"], ".nk-form__control:last-child");
    
    elementsView.form.block_title = creatElement(elementsView.form.block, ["nk-grid__col", "nk-grid__col_span_4"], ".nk-grid__col_span_4");
    elementsView.form.block_title.html('<label class="nk-form-control__label" for="list_afress">' + text.view.label.listAddress + '</label>');
    
    elementsView.form.block_text = creatElement(elementsView.form.block, ["nk-grid__col", "nk-grid__col_span_8"], ".nk-grid__col_span_8");
    elementsView.form.block_text.html('<span class="nk-text-area nk-text-area_theme_islands nk-text-area_size_m nk-text-area_invalid nk-text-area_width_available"><textarea class="nk-text-area__control" id="list_afress"></textarea></span>');
    
    /* Кнопки проверить и отменить */
    elementsView.form.parent = creatElement(elementsView.form.home, ["nk-form-submit-view", "nk-form-submit-view_size_l", "nk-section", "nk-section_level_1"], ".nk-form-submit-view");
    elementsView.form.parent.html('<button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_l nk-cancellation" type="button"><span class="nk-button__text">' + text.view.button.cancellation + '</span></button><button aria-disabled="true" class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-button_disabled nk-form-submit-view__submit" type="button" disabled="true"><span class="nk-button__text">' + text.view.button.check + '</span></button>');
    
    const buttonElements = elementsView.form.parent.find("button");
    const buttonCancellation = elementsView.form.parent.find(".nk-cancellation");

    buttonElements.hover((e) => {
      const element = $(e.delegateTarget);
      
      if (!!element.attr("disabled")) return;
      element.addClass("nk-button_hovered");
    }, (e) => {
      const element = $(e.delegateTarget);
      
      element.removeClass("nk-button_hovered nk-button_pressed");
    });
    
    buttonCancellation.mousedown((e) => {
      const element = $(e.delegateTarget);
            
      if (!!element.attr("disabled")) return;
      element.addClass("nk-button_pressed");
    });
    buttonCancellation.on("click", hideView);
    
    const textarea = elementsView.form.block_text.find(".nk-text-area .nk-text-area__control");
    const buttonSubmit = elementsView.form.parent.find(".nk-form-submit-view__submit");
    
    textarea.on("input", () => {
      textarea.val(textarea.val().replaceAll("\n", ""));
      const value = textarea.val().replace(/[^+\d]/g, "");

      if (value.length === 0) {
        textarea.parent().addClass("nk-text-area_invalid");
        
        buttonSubmit.addClass("nk-button_disabled");
        buttonSubmit.attr("aria-disabled", "true");
        buttonSubmit.attr("disabled", "true");
        buttonSubmit.off("click", checkAddress);
      }else {
        textarea.parent().removeClass("nk-text-area_invalid");
        
        if (!buttonSubmit.attr("disabled")) return;
        
        buttonSubmit.removeClass("nk-button_disabled");
        buttonSubmit.attr("aria-disabled", "false");
        buttonSubmit.removeAttr("disabled");        
        buttonSubmit.on("click", checkAddress);
      }
    });    
  };
  
  
  /**
  * Отображение информации о корректном адресе
  */
  
  const showWarningCorrect = (address) => {
    setTimeout(() => {
      const submitElement = $(".nk-geoobject-editor-view:not(.nk-address-check):not([style*='visibility: hidden;']) .nk-form-submit-view");
      
      submitElement.before('<div class="nk-section nk-section_level_1"><div class="nk-form-hint-view"><span class="nk-icon nk-icon_id_editor-hint nk-icon_align_auto nk-form-hint-view__icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill="none"><path d="M10.504 5.726c.55-.953 1.443-.952 1.992 0l5.508 9.547c.55.953.103 1.726-.996 1.726h-11.016c-1.1 0-1.545-.774-.996-1.726l5.508-9.547z" fill="#FBA233"></path><path fill="#fff" d="M11 9h1v4h-1zM11 14h1v1h-1z"></path></g></svg></span> <span>Предполагаемый адрес<br><strong>' + address + '</strong></span></div></div>');
    }, 500);
  };
  
  
  /**
  * Отслеживание изменений в окне редактора
  */
  
  const editAppView = new MutationObserver(() => {
    const objectViewElement = $(".nk-sidebar-view:not(.nk-address-check):not([style*='visibility: hidden;'])");

    /* Проверка на наличие окна объекта */
    if (!objectViewElement[0]) {
      activeObject = false;

      if (!!$(".nk-address-check")[0]) {
        hideView();
      }

      return;
    }

    typeObject = objectViewElement.find(".nk-sidebar-header-view__title-text").text();
    const addressBlock = $(".nk-geoobject-viewer-view .nk-grid.nk-sidebar-control.nk-section.nk-section_level_2.nk-geoobject-relations-view:nth-last-child(3) .nk-grid__col.nk-grid__col_span_8");

    /* Проверка на тип объекта и наличие адресов */
    if ((typeObject !== "Дорога" && typeObject !== "Административная единица") || addressBlock.text() === "отсутствуют") {
      activeObject = false;

      if (!!$(".nk-address-check")[0]) {
        hideView();
      }

      return;
    }

    if (activeObject) return;
    activeObject = true;

    if (!addressBlock.find(".nk-button-check-address")[0]) {
      addressBlock.append('<a role="link" class="nk-link nk-link_theme_islands nk-button-check-address"><span class="nk-icon nk-icon_colored nk-icon_align_auto"><svg height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><g clip-rule="evenodd" fill-rule="evenodd"><path d="m13.5 4c0-1.38071-1.1193-2.5-2.5-2.5-1.38071 0-2.5 1.11929-2.5 2.5v1c0 .27614.22386.5.5.5h4c.2761 0 .5-.22386.5-.5zm-2.5-1.5c.8284 0 1.5.67157 1.5 1.5h-3c0-.82843.6716-1.5 1.5-1.5z"></path><path d="m6 4h1.5v1c0 .82843.67157 1.5 1.5 1.5h4c.8284 0 1.5-.67157 1.5-1.5v-1h1.5c1.1046 0 2 .89543 2 2v5.416c-.6125-.2676-1.2889-.416-2-.416h-8.75c-.13807 0-.25.1119-.25.25v.5c0 .1381.11193.25.25.25h5.7495c-.3786.2844-.7155.6214-.9999 1h-4.7496c-.13807 0-.25.1119-.25.25v.5c0 .1381.11193.25.25.25h4.166c-.2676.6125-.416 1.2889-.416 2 0 1.6356.7853 3.0878 1.9995 4h-6.9995c-1.10457 0-2-.8954-2-2v-12c0-1.10457.89543-2 2-2zm1.25 5c-.13807 0-.25.11193-.25.25v.5c0 .13807.11193.25.25.25h7.5c.1381 0 .25-.11193.25-.25v-.5c0-.13807-.1119-.25-.25-.25z"></path><path d="m16 20c2.2091 0 4-1.7909 4-4s-1.7909-4-4-4-4 1.7909-4 4 1.7909 4 4 4zm-1.875-4.4644c.1666-.1706.4084-.1322.6034 0l.8805.5744 1.6627-1.582c.1667-.1707.4368-.1707.6034 0 .1667.1707.1667.4474 0 .6181l-1.8958 2.2222c-.1961.2299-.5498.2346-.752.0099l-1.1022-1.2245c-.1667-.1707-.1667-.4474 0-.6181z"></path></g></svg></span> ' + text.button + '</a>');
      const checkButton = addressBlock.find(".nk-button-check-address");

      checkButton.on("click", showCheckAddress);
    }
  });


  /**
  * Инициализация модуля
  */

  const creatAddress = () => {
    config = window.appChrome.config;

    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.addressCheck = creatAddress;
  window.appChrome.showCorrect = showWarningCorrect;
})();
