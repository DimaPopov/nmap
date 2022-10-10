'use strict';

/**
 * Ищет дубликаты адресов
 */

(function () {
  let config = window.appChrome.config;
  const popupShow = window.appChrome.popupShow;

  let activeSetting = 'defoult';
  let lastAddress = 0;

  /**
   * Открытие окна создания нового адреса
   * @param number
   */

  const copyAddress = (number) => {
    // Вызовем дополнительное меню
    const bottonMeny = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-sidebar-header-view.nk-grid.nk-section.nk-section_level_1 > .nk-grid__col:nth-child(2) > span");
    window.appChrome.triggerClick(bottonMeny);

    // Скроем подпсказку
    const popup = $(".nk-portal-local .nk-popup");
    popup.removeClass("nk-popup_visible");

    setTimeout(() => {
      // Откроем окно создания
      const copyButton = $(".nk-popup.nk-popup_visible .nk-menu__group > div:nth-child(2)");
      window.appChrome.triggerClick(copyButton);

      setTimeout(() => {
        //Заполним поле адреса
        const input = $('.nk-sidebar-view.nk-geoobject-editor-view:not([style]) .nk-text-input__control[name="addr_nm:name"]');
        input.val(number);

        input[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
        input[0].dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
        input[0].dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        input[0].dispatchEvent(new Event('input', { bubbles: true }));
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      }, 10);
    }, 200);
  };

  /**
   * Отображение информации
   */

  const render = (address) => {
    config = window.appChrome.config;
    const master = address.masters.associated_with ? address.masters.associated_with.geoObjects[0] : address.masters.addr_associated_with.geoObjects[0];

    const data = [
      {
        "method": "editor/getGeoObjectSlaves",
        "params": {
          "id": master.id,
          "branch": "0",
          "limit": 10000,
          "categoryId": "addr",
          "roleId": master.categoryId === "rd" ? "associated_with" : "addr_associated_with",
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      },
    ];

    $.ajax({
      type: "POST",
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'ru'
      },
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.data[0].error) return;

        const info = response.data[0].data.slaves;
        const warnings = info.filter(active_address => active_address.title === address.title && active_address.id != address.id);

        const addressBlock = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-size-observer .nk-island:nth-child(1) .nk-scrollable__content > div");

        if (warnings.length > 0) {
          const count_dublicate = warnings.length % 2 === 0 ? warnings.length + " дубликата" : warnings.length + " дублкиат";

          if (!addressBlock.find(".nk-poi-conflicts-viewer-view")[0]) {
            addressBlock.prepend('<div class="nk-poi-conflicts-viewer-view nk-address-conflicts nk-section nk-section_level_2"><div class="nk-poi-conflicts-viewer-view__header">' + count_dublicate + ' адреса</div><div class="nk-poi-conflicts-viewer-view__zoom-level"><div><div class="nk-poi-conflicts-viewer-view__geoobject"></div></div></div></div>');
            const parrent = $(".nk-poi-conflicts-viewer-view .nk-poi-conflicts-viewer-view__geoobject");

            warnings.forEach((warning) => {
              parrent.append('<a role="link" class="nk-link nk-link_theme_islands nk-geoobject-link-view nk-geoobject-link-view_with-preview nk-poi-conflicts-viewer-view__geoobject-link nk-poi-conflicts-viewer-view__geoobject-link_severity_critical nk-address-dublicate" href="/#!/objects/' + warning.id + '">' + warning.title + '</a>');
            });
          }
        }else {
          addressBlock.prepend('<div class="nk-address-conflicts"></div>');
        }
      }
    });


    /* Добавим кнопки для быстрого создания адреса */
    const parent = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-form.nk-section.nk-section_level_2 > .nk-form__group.nk-section.nk-section_level_2 > .nk-grid.nk-list-control.nk-form__control > .nk-grid__col.nk-grid__col_span_8 > .nk-name-row-layout:first-child");
    let numberAddres = Number(parent.find(".nk-text-control__text span").text());

    if (numberAddres) {
      $(".nk-address-buttons").remove();
      parent.append('<div class="nk-address-buttons"><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m" type="button" id="nk-address-button_n2"><span class="nk-button__text">-2</span></button><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m" type="button" id="nk-address-button_n1"><span class="nk-button__text">-1</span></button><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m" type="button" id="nk-address-button_p1"><span class="nk-button__text">+1</span></button><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m" type="button" id="nk-address-button_p2"><span class="nk-button__text">+2</span></button></div>');

      const button_m2 = $("#nk-address-button_n2");
      const button_m1 = $("#nk-address-button_n1");

      // Проверим, чтобы при умньшении адрес не стал 0 или меньше
      if (numberAddres - 2 > 0) {
        popupShow(button_m2, "Создать адрес с номером " + (numberAddres - 2));

        button_m2.hover(() => {
          button_m2.addClass("nk-button_hovered");
        }, () => {
          button_m2.removeClass("nk-button_hovered");
        });

        button_m2.on("click", () => { copyAddress(numberAddres - 2) });
      }else {
        button_m2.addClass('nk-button_disabled');
      }

      // Проверим, чтобы при умньшении адрес не стал 0 или меньше
      if (numberAddres - 1 > 0) {
        popupShow(button_m1, "Создать адрес с номером " + (numberAddres - 1));

        button_m1.hover(() => {
          button_m1.addClass("nk-button_hovered");
        }, () => {
          button_m1.removeClass("nk-button_hovered");
        });

        button_m1.on("click", () => { copyAddress(numberAddres - 1) });
      }else {
        button_m1.addClass('nk-button_disabled');
      }

      const button_p1 = $("#nk-address-button_p1");
      const button_p2 = $("#nk-address-button_p2");

      popupShow(button_p1, "Создать адрес с номером " + (numberAddres + 1));
      popupShow(button_p2, "Создать адрес с номером " + (numberAddres + 2));

      button_p1.hover(() => {
        button_p1.addClass("nk-button_hovered");
      }, () => {
        button_p1.removeClass("nk-button_hovered");
      });

      button_p1.on("click", () => { copyAddress(numberAddres + 1) });

      button_p2.hover(() => {
        button_p2.addClass("nk-button_hovered");
      }, () => {
        button_p2.removeClass("nk-button_hovered");
      });

      button_p2.on("click", () => { copyAddress(numberAddres + 2) });
    }
  };


  /**
   * Изменение выбранного варианта автоматизации создания
   * @param e
   */

  const editSelectAddress = (e) => {
    const element = $(e.delegateTarget);
    const value = element.attr("data-value");

    $("#nk-edit-address-button_" + activeSetting).removeClass("nk-button_checked");
    $("#nk-edit-address-button_" + value).addClass("nk-button_checked");

    // Если не используем автоматическую нумерацию, обнуляем счётчик
    if (value == "defoult") lastAddress = 0;
    activeSetting = value;
  }
  

  /**
   * Отслеживание открытие окна создания
   */

  const editAppView = new MutationObserver(() => {
    setTimeout(() => {
      const url = window.location.hash;
      if (url.indexOf("#!/create?") === -1) return;

      const viewTitle = $(".nk-sidebar-view.nk-geoobject-editor-view:not([style]) .nk-sidebar-header-view.nk-grid.nk-section.nk-section_level_1 .nk-sidebar-header-view__title-text").text();
      if (viewTitle !== "Адрес") return;

      if (!$(".nk-creat-address-block")[0]) {
        const input = $('.nk-sidebar-view.nk-geoobject-editor-view:not([style]) .nk-slide-animation.nk-list-edit-control__item.nk-section.nk-section_level_1:first-child input[name="addr_nm:name"]');
        const block = input.parent().parent().parent().parent().parent().parent().parent().parent();

        if (activeSetting != "defoult") {
          let edit = 0;

          edit = activeSetting == "n2" ? -2 : edit;
          edit = activeSetting == "n1" ? -1 : edit;

          edit = activeSetting == "p1" ? 1 : edit;
          edit = activeSetting == "p2" ? 2 : edit;

          input.val(lastAddress + edit);
          lastAddress = lastAddress + edit;

          input[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
          input[0].dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
          input[0].dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
          input[0].dispatchEvent(new Event('input', { bubbles: true }));
          input[0].dispatchEvent(new Event('change', { bubbles: true }));
        }

        input.on("blur", () => {
          const value = Number(input.val());
          if (value) lastAddress = value;
        });

        block.append('<span class="nk-radio-group nk-radio-group_type_button nk-radio-group_theme_islands nk-radio-group_size_m nk-control-group nk-creat-address-block"><label class="nk-radio"><input type="hidden" value="normal"><button class="nk-button nk-button_theme_islands nk-button_size_m" aria-pressed="false" type="button" id="nk-edit-address-button_n2" data-value="n2"><span class="nk-button__text">-2</span></button></label><label class="nk-radio"><button class="nk-button nk-button_theme_islands nk-button_size_m" aria-pressed="false" type="button" id="nk-edit-address-button_n1" data-value="n1"><span class="nk-button__text">-1</span></button></label><label class="nk-radio"><button class="nk-button nk-button_theme_islands nk-button_size_m" aria-pressed="true" type="button" id="nk-edit-address-button_defoult" data-value="defoult"><span class="nk-button__text">—</span></button></label><label class="nk-radio"><button class="nk-button nk-button_theme_islands nk-button_size_m" aria-pressed="false" type="button" id="nk-edit-address-button_p1" data-value="p1"><span class="nk-button__text">+1</span></button></label><label class="nk-radio"><button class="nk-button nk-button_theme_islands nk-button_size_m" aria-pressed="false" type="button" id="nk-edit-address-button_p2" data-value="p2"><span class="nk-button__text">+2</span></button></label></span>');

        // Включим текущий переключатель в интерфейсе
        $("#nk-edit-address-button_" + activeSetting).addClass('nk-button_checked');

        const button_m2 = $("#nk-edit-address-button_n2");
        const button_m1 = $("#nk-edit-address-button_n1");

        popupShow(button_m2, "Заполнять номер дома по убыванию с разницей 2");
        popupShow(button_m1, "Заполнять номер дома по убыванию с разницей 1");

        button_m2.hover(() => {
          button_m2.addClass("nk-button_hovered");
        }, () => {
          button_m2.removeClass("nk-button_hovered");
        });

        button_m1.hover(() => {
          button_m1.addClass("nk-button_hovered");
        }, () => {
          button_m1.removeClass("nk-button_hovered");
        });

        button_m2.on("click", editSelectAddress);
        button_m1.on("click", editSelectAddress);


        const button_defoult = $("#nk-edit-address-button_defoult");
        popupShow(button_defoult, "Не использовать автоматическое заполнение номера дома");

        button_defoult.hover(() => {
          button_defoult.addClass("nk-button_hovered");
        }, () => {
          button_defoult.removeClass("nk-button_hovered");
        });

        button_defoult.on("click", editSelectAddress);


        const button_p1 = $("#nk-edit-address-button_p1");
        const button_p2 = $("#nk-edit-address-button_p2");

        popupShow(button_p1, "Заполнять номер дома адреса по возрастанию с разницей 1");
        popupShow(button_p2, "Заполнять номер дома адреса по возрастанию с разницей 2");

        button_p1.hover(() => {
          button_p1.addClass("nk-button_hovered");
        }, () => {
          button_p1.removeClass("nk-button_hovered");
        });

        button_p2.hover(() => {
          button_p2.addClass("nk-button_hovered");
        }, () => {
          button_p2.removeClass("nk-button_hovered");
        });

        button_p1.on("click", editSelectAddress);
        button_p2.on("click", editSelectAddress);
      }
    }, 100);
  });


  window.appChrome.init.address = () => {
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };


  /**
   * Подписываемся на получение уведомления об открытии схемы помещения
   */

  window.appChrome.eventObect.append({
    title: ['Адрес', 'Address'],
    category: "addr",
    check: () => {
      const addressConflictsObject = $(".nk-sidebar-view.nk-geoobject-viewer-view:not([style]) .nk-address-conflicts");

      return addressConflictsObject[0];
    },
    render: render
  });
})();