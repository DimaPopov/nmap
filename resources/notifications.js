'use strict';

/**
 * Взаимодействие с уведомлениями
 */

(function () {
  /**
   * Создание нового уведомления
   *
   * info - баннер по центру экрана
   * fr_mos_ru - Информация фонда реновации
   *
   * @param {suggest|success|error|warning|info|fr_mos_ru} type
   * @param text
   * @param durationInSeconds
   * @param progress
   */

  const showNotification = (type, text, durationInSeconds = 5, progress = false) => {
    const notificationTemplate = '<div class="custom-notification nk-notification-view nk-notification-view_type_{type}">' + (progress ? '<span class="nk-icon nk-icon_id_spinner nk-icon_align_auto nk-notification-view__progress"><span class="nk-spinner nk-spinner_theme_islands nk-spinner_size_xs"></span></span>' : '') + `<div class="nk-notification-view__content">${text}</div></div>`;

    const preservedNotification = $(".nk-notification-view_type_suggest:not(.custom-notification)");
    const doNotRestoreNotification = preservedNotification ? preservedNotification.hasClass("nk-notification-view_animation-stage_leaving") : true;

    cancelAllNotifications();

    let container = $("#notificationArea");
    if (!container[0]) {
      $("body > div.nk-app-view > div:not([class])").append('<div id="notificationArea"></div>');
      container = $("#notificationArea");
    }

    if (type === "fr_mos_ru") {
      type = "info nk-notification-view_type_fr_mos_ru";
    }

    container.append(notificationTemplate.replace("{type}", type));


    const newNotificationBubble = $(".custom-notification");
    restoreNotification(newNotificationBubble);

    if (durationInSeconds > 1) {
      setTimeout(() => {
        cancelNotification(newNotificationBubble);
        if (preservedNotification[0]) {
          if (!newNotificationBubble.parent()[0] || doNotRestoreNotification) {
            preservedNotification.css("visibility", "hidden");
          }
          restoreNotification(preservedNotification);
        }
      }, durationInSeconds * 1000);
    }
  };


  /**
   * Скрытие уведомления
   */

  const hideNotification = (bubble) => {
    if (!bubble[0]) return;

    bubble.removeClass("nk-notification-view_animation-stage_leaving");
  };


  /**
   * Перезагрузка уведомления
   */

  const restoreNotification = (bubble) => {
    bubble.removeClass("nk-notification-view_animation-stage_leaving");
    bubble.addClass("nk-notification-view_animation-stage_entering");

    setTimeout(() => {
      bubble.removeClass("nk-notification-view_animation-stage_entering")
    }, 500);
  };


  /**
   * Удалить все уведомления
   */

  const cancelAllNotifications = () => {
    const bubbles = $(".nk-notification-view");

    bubbles.each((id, element) => {
      cancelNotification(element);
    });
  };


  /**
   * Удаление одного уведомления
   */

  const cancelNotification = (bubble) => {
    if (bubble && $(bubble).hasClass("custom-notification")) {
      $(bubble).addClass("nk-notification-view_animation-stage_leaving");
      setTimeout(() => { bubble.remove(); }, 500);
    }else {
      hideNotification(bubble);
    }
  };

  window.appChrome.notification = showNotification;
})();