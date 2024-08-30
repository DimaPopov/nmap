'use strict';

/**
* Добавляет возможность поиска пользователей
*/

(function () {
  let lastId = null;

  const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  const text = window.appChrome.text.getUser;
  const creatElement = window.appChrome.creatElement;
  
  
  /**
   * Форматирование даты
   * @param date - Перевод даты в русскоязычную
   *
   * @returns {string} - Человекочитаемый формат даты
   */

  const formatDate = (date) => {    
    let day = date.getDate();
    let month_text = month[date.getMonth()];
    let years = date.getFullYear() % 10000;

    return day + ' ' + month_text + ' ' + years;
  }


  /**
   * Отображение дополнительной информации
   *
   * @param user - Информация о пользователе
   */
  
  const renderProfile = (user) => {
    const config = window.appChrome.config;
    const popup = $(".nk-portal-local .nk-popup");

    const profileView = $(".nk-user-profile-view");
    const profileHeader = profileView.find(".nk-user-profile-view__header");
    
    if (user.status === "deleted") {
      const status = profileHeader.find(".nk-user-profile-view__status");
      status.before('<div class="nk-user-profile-view__name nk-user-name-view_deleted">' + user.displayName + '</div>');
      
      if (user.outsourcer || user.yandex) {
        status.text("Сотрудник удалён");
      }
      
      const icon = profileHeader.find(".nk-user-icon_size_large");
      icon.removeClass("nk-user-icon_deleted");
      icon.css("background-image", "url(https://avatars.mds.yandex.net/get-yapic/" + user.avatarId + "/islands-retina-50)");
    }
    
    const lastGroup = profileView.find(".nk-user-profile-view__group.nk-section.nk-section_level_2.nk-grid:last-child");    
    if (lastGroup[0]) {
      lastGroup.before("<div class='nk-info-user-details nk-section nk-section_level_2'></div>");
    }else {
      profileView.find(".nk-scrollable__content .nk-size-observer").append("<div class='nk-info-user-details nk-section nk-section_level_2'></div>");
    }

    let parent = profileView.find(".nk-info-user-details");

    /* Аутсорсер ли */
    if (user.outsourcer && user.status !== "deleted") {
      profileHeader.find(".nk-user-profile-view__name").after('<div class="nk-user-profile-view__status">Аутсорсер</div>'); 
    }
    
    /* Робот ли */
    if (user.moderationStatus === "robot" && user.status !== "deleted") {
      profileHeader.find(".nk-user-profile-view__name").after('<div class="nk-user-profile-view__status">Робот</div>'); 
    }

    /* Добавление информации о должности и/или специальных правах */
    if (user.publicId && user.status !== "deleted" && !user.outsourcer && !user.yandex) {
      const data = [
        {
          "method": "social/getUserStat",
          "params": {
            "branch": "0",
            "userPublicId": user.publicId,
            "token": JSON.parse(localStorage.getItem("nk:token"))
          }
        },
        {
          "method": "social/getUserExpertise",
          "params": {
            "branch": "0",
            "userPublicId": user.publicId,
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
          let infoAccessElement;
          
          /* Проверка наличия прав в схемах помещений */

          if (response.data[0].data.stats) {
            const indoor = response.data[0].data.stats.editStats.categoryGroups.indoor_group;

            if (indoor.new > 0 || indoor.total > 0) {
              if (!infoAccessElement) {
                infoAccessElement = creatElement(parent, ["nk-user-profile-view__group", "nk-section", "nk-section_level_2", "nk-grid", "nk-user-profile-access"], ".nk-user-profile-access:last-child");

                creatElement(infoAccessElement, ["nk-user-profile-view__group-title", "nk-grid__col", "nk-grid__col_span_3"], ".nk-user-profile-view__group-title", text.view.info.access);
                infoAccessElement = creatElement(infoAccessElement, ["nk-user-profile-view__group-content", "nk-grid__col", "nk-grid__col_span_9", "nk-info-user__access", "nk-grid"], ".nk-info-user__access");
              }

              infoAccessElement.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_indoor-group"></span>');

              const groupIcon = infoAccessElement.find(".nk-user-stat-badge-view_id_indoor-group");
              groupIcon.hover(() => {
                popup.find(".nk-popup__content").text("Схемы помещений");

                const topPopup = groupIcon[0].offsetHeight + groupIcon.offset().top + 5;
                const leftPopup = window.innerWidth - groupIcon.offset().left;

                popup.css({ "left": window.innerWidth - leftPopup + "px", "top": topPopup + "px" });
                popup.addClass("nk-popup_visible");
              }, () => {
                popup.removeClass("nk-popup_visible");
              });
            }
          }



          /* Проверка наличия прав в нитках транспорта */

          if (response.data[1].data) {
            const experts = response.data[1].data.expertExpertise;

            if (experts) {
              experts.forEach((expert) => {
                if (expert === "transport_group") {
                  if (!infoAccessElement) {
                    infoAccessElement = creatElement(parent, ["nk-user-profile-view__group", "nk-section", "nk-section_level_2", "nk-grid", "nk-user-profile-access"], ".nk-user-profile-access:last-child");

                    creatElement(infoAccessElement, ["nk-user-profile-view__group-title", "nk-grid__col", "nk-grid__col_span_3"], ".nk-user-profile-view__group-title", text.view.info.access);
                    infoAccessElement = creatElement(infoAccessElement, ["nk-user-profile-view__group-content", "nk-grid__col", "nk-grid__col_span_9", "nk-info-user__access", "nk-grid"], ".nk-info-user__access");
                  }

                  infoAccessElement.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_transport-group"></span>');

                  const transportIcon = infoAccessElement.find(".nk-user-stat-badge-view_id_transport-group");
                  transportIcon.hover(() => {
                    popup.find(".nk-popup__content").text("Нитки транспорта");

                    const topPopup = transportIcon[0].offsetHeight + transportIcon.offset().top + 5;
                    const leftPopup = window.innerWidth - transportIcon.offset().left;

                    popup.css({ "left": window.innerWidth - leftPopup + "px", "top": topPopup + "px" });
                    popup.addClass("nk-popup_visible");
                  }, () => {
                    popup.removeClass("nk-popup_visible");
                  });
                }
              });
            }
          }
        }
      });
    }
  };


  /**
   * Получение дополнительных данных о пользователе
   *
   * @param login - Логин пользователя
   */
  
  const loadDataProfile = (login) => {
    if (!login) return false;
    const config = window.appChrome.config;
            
    const data = [
        {
          "method": "acl/getUsers",
          "params": {
            "name": login,
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
        const users = response.data[0].data.users;
        
        users.forEach((user) => {          
          if (user.login === login) {
            $('.nk-portal-local').remove();
            $("body").append('<div class="nk-portal nk-portal-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_view_tooltip" style="z-index: 111001;"><div class="nk-size-observer"><div class="nk-popup__content"></div></div></div><!----></div><!----><!----></div>');
            
            
            setTimeout(() => renderProfile(user), 15);
            return true;
          }
        });
      },
      error: function () {
        window.appChrome.notification("error", text.notification.error.default);
      }
    });
  };


  /**
   * Отслеживание изменений в окне редактора
   *
   * @type {MutationObserver}
   */
  
  const editAppView = new MutationObserver(() => {
    const isUser = window.location.hash.indexOf("users/") !== -1;
    const userId = isUser ? window.location.hash.split("users/")[1].split("?")[0] : null;
                
    if (isUser && lastId !== userId && $(".nk-user-profile-view")[0]) {
      lastId = userId;
      const config = window.appChrome.config;
            
      const data = [
          {
            "method": "acl/getUser",
            "params": {
              "userPublicId": userId,
              "withPolicies": true,
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
          const user = response.data[0].data;
          
          loadDataProfile(user.login);
        },
        error: function () {
          window.appChrome.notification("error", text.notification.error.default);
        }
      });
    }
  });


  /**
   * Инициализация подгрузки дополнительной информации в профиль
   */

  const creatGetProfile = () => {
    try {
      const appViewElement = document.querySelector(".nk-app-view");
      editAppView.observe(appViewElement, {childList: true});
    }catch {
      window.appChrome.notification("error", "Модуль подгрузки дополнительной информации в профиль не запущен");
    }
  };
  
  window.appChrome.init.getProfile = creatGetProfile;
})();