'use strict';

/**
* Добавляет возможность взаимодействовать с уведомлениями
*/

(function () {
  /**
  * Создание нового уведомления
  */
  
  const showNotification = (type, text, durationInSeconds = 5) => {
    const notificationTemplate = '<div class="custom-notification nk-notification-view nk-notification-view_type_{type}"><div class="nk-notification-view__content">{text}</div></div>';
    const preservedNotification = $(".nk-notification-view_type_suggest:not(.custom-notification)");
    const doNotRestoreNotification = preservedNotification ? preservedNotification.hasClass("nk-notification-view_animation-stage_leaving") : true;
    
    cancelAllNotifications();

    let container = $("#notificationArea");
    if (!container[0]) {
        $("body > div.nk-app-view > div:not([class])").append('<div id="notificationArea"></div>');
        container = $("#notificationArea");
    }
    
    container.append(notificationTemplate.replace("{type}", type).replace("{text}", text));
    
    
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
  }

  
  /**
  * Скрытие уведомления
  */
  
  const hideNotification = (bubble) => {
    if (!bubble) return;
    
    bubble.removeClass("nk-notification-view_animation-stage_leaving");
  }
  
  
  /**
  * Перезагрузка уведомления
  */

  const restoreNotification = (bubble) => {
    bubble.removeClass("nk-notification-view_animation-stage_leaving");
    bubble.addClass("nk-notification-view_animation-stage_entering");
    
    setTimeout(() => { 
      bubble.removeClass("nk-notification-view_animation-stage_entering") 
    }, 500);
  }

  
  /**
  * Удалить все уведомления
  */
  
  const cancelAllNotifications = () => {
    const bubbles = $(".nk-notification-view");
    
    bubbles.each((id, element) => {
      cancelNotification(element);
    });
  }

  
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
  }
  
  window.appChrome.notification = showNotification;
})();