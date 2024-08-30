'use strict';

/**
 * Добавляет возможность группового вынесения резолюции по задачам модерации
 */

(function () {
  const popupShow = window.appChrome.popupShow;

  /**
   * Перезагружает список задач модерации
   */

  const reloadTasks = () => {
    const firstNewTask = $(".nk-sidebar-view.nk-island:not([style]) .nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1 > .nk-moderation-region-tasks-view__filter-row:first-child .nk-radio-group .nk-radio.nk-radio_checked:first-child")[0];


    if (firstNewTask) {
      window.appChrome.triggerClick($(".nk-sidebar-view.nk-island:not([style]) .nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1 > .nk-moderation-region-tasks-view__filter-row:first-child .nk-radio-group .nk-radio:nth-child(2) .nk-button"));

      setTimeout(() => {
        window.appChrome.triggerClick($(".nk-sidebar-view.nk-island:not([style]) .nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1 > .nk-moderation-region-tasks-view__filter-row:first-child .nk-radio-group .nk-radio:nth-child(1) .nk-button"));
      }, 10);
    } else {
      window.appChrome.triggerClick($(".nk-sidebar-view.nk-island:not([style]) .nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1 > .nk-moderation-region-tasks-view__filter-row:first-child .nk-radio-group .nk-radio:nth-child(1) .nk-button"));

      setTimeout(() => {
        window.appChrome.triggerClick($(".nk-sidebar-view.nk-island:not([style]) .nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1 > .nk-moderation-region-tasks-view__filter-row:first-child .nk-radio-group .nk-radio:nth-child(2) .nk-button"));
      }, 10);
    }
  };

  /**
   * Применяет резолюцию к загруженным задачам модерации
   * @param action
   */

  const moderationAction = (action) => {
    const config = window.appChrome.config;

    const hesh_url = window.location.href.replace(window.location.origin + "/#!/", "");
    const zone = Number(hesh_url.replace("moderation/regions/", "").split("/")[0]);
    if (!zone) return;

    const data = [
      {
        "method": "moderation/acquireModerationTasks",
        "params": {
          "regionId": zone + "",
          "moderationMode": window.appChrome.user.yandex ? "cartographer" : "moderator",
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

        /* Соберем список правок */
        let tasks = [];
        response.data[0].data.tasks.forEach((task) => {
          tasks.push(task.id + "");
        });

        /* Применим резолюцию к задачам модерации */
        let dataModerationTasks = [];

        switch (action) {
          case "close":
            dataModerationTasks = [
              {
                "method": "moderation/closeModerationTasks",
                "params": {
                  "regionId": zone + "",
                  "taskIds": tasks,
                  "resolution": "approve",
                  "token": JSON.parse(localStorage.getItem("nk:token"))
                }
              },
            ];

            break;
          case "accept":
            dataModerationTasks = [
              {
                "method": "moderation/resolveModerationTasks",
                "params": {
                  "regionId": zone + "",
                  "taskIds": tasks,
                  "resolution": "accept",
                  "token": JSON.parse(localStorage.getItem("nk:token"))
                }
              },
            ];

            break;
          case "revert":
            dataModerationTasks = [
              {
                "method": "moderation/resolveModerationTasks",
                "params": {
                  "regionId": zone + "",
                  "taskIds": tasks,
                  "resolution": "revert",
                  "revertReason":"vandalism",
                  "token": JSON.parse(localStorage.getItem("nk:token"))
                }
              },
            ];

            break;
        }

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
          data: JSON.stringify(dataModerationTasks),
          success: function (response) {
            console.log(response);
            reloadTasks();
          }
        });
      }
    });
  };


  /**
   * Отслеживание изменений в окне редактора
   */

  const editAppView = new MutationObserver(() => {
    /* Проверка наличия окна */
    const objectViewElement = $(".nk-sidebar-view.nk-island:not([style])");
    if (!objectViewElement[0]) {
      $(".nk-action-section-moderation").remove();
      return;
    }

    /* Проверим, что есть панель фильтров */
    const filterBlock = objectViewElement.find(".nk-size-observer > .nk-sidebar-header-view + .nk-section.nk-section_level_1");
    if (!filterBlock[0]) {
      $(".nk-action-section-moderation").remove();
      return;
    }

    /* Проверка открытия панели разбора задач модерации */
    const hesh_url = window.location.href.replace(window.location.origin + "/#!/", "");
    const zone = Number(hesh_url.replace("moderation/regions/", "").split("/")[0]);
    if (!zone) {
      $(".nk-action-section-moderation").remove();
      return;
    }

    /* Проверим, что нет кнопок от сервиса */
    const actionSection = filterBlock.parent().find(".nk-action-section-moderation");
    if (actionSection[0]) {
      /* Если нет задач модерации, блокируем кнопки */
      if (objectViewElement.find(".nk-list-view__no-items")[0]) {
        // Одобрить
        const buttonClose = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_close");
        buttonClose.attr('aria-disabled', 'true');
        buttonClose.attr('disabled', 'true');
        buttonClose.addClass('nk-button_disabled');
        buttonClose.off("click");

        // Принять
        const buttonAccept = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_accept");
        buttonAccept.attr('aria-disabled', 'true');
        buttonAccept.attr('disabled', 'true');
        buttonAccept.addClass('nk-button_disabled');
        buttonAccept.off("click");

        // Откатить
        const buttonRevert = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_revert");
        buttonRevert.attr('aria-disabled', 'true');
        buttonRevert.attr('disabled', 'true');
        buttonRevert.addClass('nk-button_disabled');
        buttonRevert.off("click");
      }

      return;
    }

    filterBlock.after('<div class="nk-section nk-section_level_1 nk-action-section-moderation"><div class="nk-moderation-region-tasks-view__filter-row"><!----><!----><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m nk-moderation-task-view__actions-button nk-moderation-tasks-view__actions-button_action_close" type="button" style="padding-left: 5px;"><span class="nk-icon nk-icon_align_auto"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22"><g fill="none" fill-rule="evenodd"><circle cx="11" cy="11" r="10" fill="#8FCB69"></circle><path fill="#FFF" d="m7.92 10.446-1.24 1.275 3.716 3.612 5.609-7.291-1.41-1.084-4.391 5.709z"></path></g></svg></span><span class="nk-button__text">Одобрить</span></button><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m nk-moderation-task-view__actions-button nk-moderation-tasks-view__actions-button_action_accept" type="button" style="padding-left: 5px;"><span class="nk-icon nk-icon_align_auto"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22"><g fill="none" fill-rule="evenodd"><circle cx="11" cy="11" r="10" fill="#FC5"></circle><path fill="#FFF" d="M12 5h-2v6.535l4.277 2.852 1.11-1.664L12 10.465z"></path></g></svg></span><span class="nk-button__text">Принять</span></button><button aria-disabled="false" class="nk-button nk-button_theme_islands nk-button_size_m nk-moderation-task-view__actions-button nk-moderation-tasks-view__actions-button_action_revert" type="button" style="padding-left: 5px;"><span class="nk-icon nk-icon_align_auto"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22"><g fill="none" fill-rule="evenodd"><circle cx="11" cy="11" r="10" fill="#FF6464"></circle><path fill="#FFF" d="m8.172 6.757 7.07 7.071-1.414 1.415-7.07-7.071z"></path><path fill="#FFF" d="m15.243 8.172-7.071 7.07-1.415-1.414 7.071-7.07z"></path></g></svg></span><span class="nk-button__text">Откатить</span></button><!----><!----></div></div>');

    // Одобрить
    const buttonClose = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_close");

    if (window.appChrome.user.yandex) {
      buttonClose.hover(() => {
        buttonClose.addClass("nk-button_hovered");
      }, () => {
        buttonClose.removeClass("nk-button_hovered");
      })

      popupShow(buttonClose, "Подтвердить загруженные задачи модерации");
      buttonClose.on("click", () => moderationAction("close"));
    }else {
      buttonClose.addClass('nk-button_disabled');
      popupShow(buttonClose, "Закрытие задачи модерации доступно только сотрудникам Яндекса");
    }

    // Принять
    const buttonAccept = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_accept");
    buttonAccept.hover(() => {
      buttonAccept.addClass("nk-button_hovered");
    }, () => {
      buttonAccept.removeClass("nk-button_hovered");
    });

    popupShow(buttonAccept, "Принять загруженные задачи модерации");
    buttonAccept.on("click", () => moderationAction("accept"));


    // Откатить
    const buttonRevert = $(".nk-action-section-moderation .nk-moderation-tasks-view__actions-button_action_revert");
    buttonRevert.hover(() => {
      buttonRevert.addClass("nk-button_hovered");
    }, () => {
      buttonRevert.removeClass("nk-button_hovered");
    });

    popupShow(buttonRevert, "Откатить загруженные задачи модерации с причиной «Вандализм»");
    buttonRevert.on("click", () => moderationAction("revert"));

  });

  /**
   * Инициализация модуля
   */

  const initModeration = () => {
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, { childList: true, subtree: true });
  };

  window.appChrome.init.moderation = initModeration;
})();