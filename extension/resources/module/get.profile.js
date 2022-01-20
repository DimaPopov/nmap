'use strict';

/**
* Добавляет возможность поиска пользователей
*/

(function () {
  let lastId = null;
  let config = {};
  
  const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  const text = window.appChrome.text.getUser;
  
  
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
    const popup = $(".nk-portal-local .nk-popup");
    
    const profileView = $(".nk-user-profile-view");
    const profileHeader = profileView.find(".nk-user-profile-view__header");
        
    if (user.status === "deleted") {
      const status = profileHeader.find(".nk-user-profile-view__status");
      status.before('<div class="nk-user-profile-view__name nk-user-link-view_deleted">' + user.displayName + '</div>');
      
      if (user.outsourcer || user.yandex) {
        status.text("Сотрудник уволен");
      }
      
      const icon = profileHeader.find(".nk-user-icon_size_large");
      icon.removeClass("nk-user-icon_deleted");
      icon.css("background-image", "url(https://avatars.mds.yandex.net/get-yapic/" + user.avatarId + "/islands-retina-50)");
    }
        
    if (user.karma === 100 && !user.outsourcer && !user.yandex) {
      profileHeader.after('<div class="nk-section nk-section_level_1"><div class="nk-form-hint-view"><span class="nk-icon nk-icon_id_editor-hint nk-icon_align_auto nk-form-hint-view__icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill="none"><path d="M10.504 5.726c.55-.953 1.443-.952 1.992 0l5.508 9.547c.55.953.103 1.726-.996 1.726h-11.016c-1.1 0-1.545-.774-.996-1.726l5.508-9.547z" fill="#FBA233"></path><path fill="#fff" d="M11 9h1v4h-1zM11 14h1v1h-1z"></path></g></svg></span> Является спамером</div></div>');
    }else if (user.karma >= 85 && !user.outsourcer && !user.yandex) {
      profileHeader.after('<div class="nk-section nk-section_level_1"><div class="nk-form-hint-view"><span class="nk-icon nk-icon_id_editor-hint nk-icon_align_auto nk-form-hint-view__icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill="none"><path d="M10.504 5.726c.55-.953 1.443-.952 1.992 0l5.508 9.547c.55.953.103 1.726-.996 1.726h-11.016c-1.1 0-1.545-.774-.996-1.726l5.508-9.547z" fill="#FBA233"></path><path fill="#fff" d="M11 9h1v4h-1zM11 14h1v1h-1z"></path></g></svg></span> С высокой вероятностью является спамером</div></div>');
    }
    
    const lastGroup = profileView.find(".nk-user-profile-view__group.nk-section.nk-section_level_2.nk-grid:last-child");    
    if (lastGroup[0]) {
      lastGroup.before("<div class='nk-info-user-details nk-section nk-section_level_2'></div>");
    }else {
      profileView.find(".nk-scrollable__content .nk-size-observer").append("<div class='nk-info-user-details nk-section nk-section_level_2'></div>");
    }
    
    let parent = profileView.find(".nk-info-user-details");
    
    /* Аутсорсер ли */
    if (user.outsourcer) {
      profileHeader.find(".nk-user-profile-view__name").after('<div class="nk-user-profile-view__status">Аутсорсер</div>'); 
    }
    
    /* Робот ли */
    if (user.moderationStatus === "robot") {
      profileHeader.find(".nk-user-profile-view__name").after('<div class="nk-user-profile-view__status">Робот</div>'); 
    }
    
    /* Добавление информации о должности и/или специальных прав */
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
        url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (response) {
          /* Проверка наличия прав в схемах помещений */

          if (response.data[0].data.stats) {
            const indoor = response.data[0].data.stats.editStats.categoryGroups.indoor_group;

            if (indoor.new > 0 || indoor.total > 0) {
              if (!viewElements.infoAccess) {
                viewElements.infoAccess = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                creatElement(viewElements.infoAccess, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.access);
                viewElements.infoAccess = creatElement(viewElements.infoAccess, ["nk-info-user__access", "nk-grid"], ".nk-info-user__access");
              }

              viewElements.infoAccess.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_indoor-group"></span>');

              const groupIcon = viewElements.infoAccess.find(".nk-user-stat-badge-view_id_indoor-group");
              groupIcon.hover(() => {
                popup.find(".nk-popup__content").text("Схемы помещений");

                const topPopup = groupIcon[0].offsetHeight + groupIcon.offset().top + 5;
                const leftPopup = window.innerWidth - groupIcon.offset().left + 10;

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
                  if (!viewElements.infoAccess) {
                    viewElements.infoAccess = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                    creatElement(viewElements.infoAccess, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.access);
                    viewElements.infoAccess = creatElement(viewElements.infoAccess, ["nk-info-user__access", "nk-grid"], ".nk-info-user__access");
                  }

                  viewElements.infoAccess.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_transport-group"></span>');

                  const transportIcon = viewElements.infoAccess.find(".nk-user-stat-badge-view_id_transport-group");
                  transportIcon.hover(() => {
                    popup.find(".nk-popup__content").text("Нитки транспорта");

                    const topPopup = transportIcon[0].offsetHeight + transportIcon.offset().top + 5;
                    const leftPopup = window.innerWidth - transportIcon.offset().left + 10;

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

    /* Если пользователь удалён, добавляем информацию о том, кто удалил */
    if (user.status === "deleted") {
      let iconModified = "";
      let textIconModified = "";
      
      const date = new Date(user.modifiedAt);
      let deleteDate = formatDate(date);

      const todayDate = formatDate(new Date());
      const yesterdayDate = formatDate(new Date(Date.now()-86400000));

      deleteDate = todayDate === deleteDate ? 'сегодня' : deleteDate;
      deleteDate = yesterdayDate === deleteDate ? 'вчера' : deleteDate;

      deleteDate +=  ' в ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

      if (user.displayName === user.modifiedBy.displayName || user.deleteReason === "passport") {
        const title = user.yandex ? text.view.info.delete.yndx.info : text.view.info.delete.user.info;
        const reason = text.deleteReason[user.deleteReason];
        
        parent.append('<div class="nk-user-profile-view__group nk-section nk-section_level_2 nk-grid"><div class="nk-user-profile-view__group-title nk-grid__col nk-grid__col_span_3">' + title + '</div><div class="nk-user-profile-view__group-content nk-grid__col nk-grid__col_span_9">' + reason + '<br><span class="nk-time-delete">' + deleteDate + '</span></div></div>');
      }else {
        if (user.modifiedBy.yandex) {
          iconModified = '<span class="nk-icon nk-icon_id_yandex nk-icon_align_auto nk-user-link-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><path d="M2,2 L16,2 L21,11 L16,20 L2,20 L2,2 Z" fill="#FFCC00"></path><path d="M11.0107422,15 L11.0107422,11.7128906 C11.0107422,11.7128906 10.8335785,11.7880852 10.6276856,11.9384766 C10.4217926,12.0888679 10.0699895,12.538245 9.57226563,13.2866211 L8.42285157,15 L6.52148438,15 L7.38291016,13.46 C7.76246935,12.8551402 7.96503794,12.4281425 8.190625,12.1828613 C8.41621207,11.9375802 8.59908684,11.7182627 8.93925782,11.5249023 C8.20520467,11.4103184 7.67526205,11.155194 7.34941407,10.7595215 C7.02356608,10.3638489 6.86064453,9.89030224 6.86064453,9.33886719 C6.86064453,8.85904708 6.98149294,8.43383974 7.22319336,8.06323242 C7.46489379,7.6926251 7.7835755,7.34376691 8.17924805,7.21665039 C8.5749206,7.08953387 8.96663018,7.02597656 9.75439453,7.02597656 L13.0005859,7.02597656 L13.0005859,15 L11.0107422,15 Z M11.0107422,8.45800781 C11.0107422,8.45800781 9.7253428,8.47233059 9.52661134,8.50097656 C9.32787987,8.52962254 9.15690177,8.62630126 9.01367188,8.79101562 C8.870442,8.95572999 8.79882813,9.17057159 8.79882813,9.43554688 C8.79882813,9.7112644 8.86775648,9.93058187 9.00561524,10.0935059 C9.143474,10.2564299 9.31892798,10.3575844 9.53198243,10.3969727 C9.74503688,10.4363609 11.0107422,10.4560547 11.0107422,10.4560547 L11.0107422,8.45800781 Z" fill="#664C0E"></path></g></svg></span>';
          textIconModified = "Сотрудник Яндекса";
        }else if (user.modifiedBy.moderationStatus === "robot") {
          iconModified = '<span class="nk-icon nk-icon_id_robot nk-icon_align_auto nk-user-link-view__icon"><svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><path d="m6.5 1c-.55228 0-1 .44772-1 1 0 .37014.2011.69331.5.86622v2.13378h-4v13h14v-13h-1v-2.13378c.2989-.17291.5-.49608.5-.86622 0-.55228-.4477-1-1-1s-1 .44772-1 1c0 .37014.2011.69331.5.86622v2.13378h-7v-2.13378c.2989-.17291.5-.49608.5-.86622 0-.55228-.44772-1-1-1z" fill="#fc0"></path><g fill="#664c0e"><path d="m4 10h2v1h1v2h-3z"></path><path d="m6 15h6c0 .5523-.4477 1-1 1h-4c-.55228 0-1-.4477-1-1z"></path><path d="m13 10h-2v3h3v-2h-1z"></path></g><path d="m16 5h4v13h-4z" fill="#f0bf01"></path></svg></span>';
          textIconModified = "Робот";
        }

        const iconModifiedClass = !!iconModified ? " nk-user-link-view_has-icon" : "";
        const deleteModifiedUserClass = user.modifiedBy.status === "deleted" ? " nk-user-link-view_deleted" : " nk-user-link-view_colored";

        let title = user.yandex ? text.view.info.delete.yndx.time : text.view.info.delete.user.time;
        const reason = text.deleteReason[user.deleteReason];

        parent.append('<div class="nk-user-profile-view__group nk-section nk-section_level_2 nk-grid"><div class="nk-user-profile-view__group-title nk-grid__col nk-grid__col_span_3">' + title + '</div><div class="nk-user-profile-view__group-content nk-grid__col nk-grid__col_span_9"><a role="link" aria-disabled="false" class="nk-link nk-link_theme_islands nk-user-link-view' + deleteModifiedUserClass + iconModifiedClass + '" href="/#!/users/' + user.modifiedBy.publicId + '"><span class="nk-user-link-view__name">' + user.modifiedBy.displayName + '</span>' + iconModified + '</a> <span class="nk-time-delete">' + deleteDate + '</span></div></div>');

        if (!!iconModified.length) {
            const iconModifiedRole = parent.find(".nk-user-profile-view__group .nk-user-profile-view__group-content .nk-user-link-view .nk-icon");
            iconModifiedRole.hover(() => {
              popup.find(".nk-popup__content").text(textIconModified);

              const topPopup = iconModifiedRole[0].offsetHeight + iconModifiedRole.offset().top + 3;
              const leftPopup = window.innerWidth - iconModifiedRole.offset().left;

              popup.css({ "left": window.innerWidth - leftPopup + "px", "top": topPopup + "px" });
              popup.addClass("nk-popup_visible");
            }, () => {
              popup.removeClass("nk-popup_visible");
            });
          }
        
        title = user.yandex ? text.view.info.delete.yndx.info : text.view.info.delete.user.info;
        
        parent.append('<div class="nk-user-profile-view__group nk-grid"><div class="nk-user-profile-view__group-title nk-grid__col nk-grid__col_span_3">' + title + '</div><div class="nk-user-profile-view__group-content nk-grid__col nk-grid__col_span_9">' + reason + '</div></div>');
      }
    }
  };


  /**
   * Получение дополнительных данных о пользователе
   *
   * @param login - Логин пользователя
   */
  
  const loadDataProfile = (login) => {
    if (!login) return false;
    config = JSON.parse(document.querySelector("#config").innerHTML);
            
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
      url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
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
      config = JSON.parse(document.querySelector("#config").innerHTML);
            
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
        url: "https://n.maps.yandex.ru" + config.api.url + "/batch",
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
   * Инициализация подгрудки дополнительной информации в профиль
   */

  const creatGetProfile = () => {    
    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };
  
  window.appChrome.init.getProfile = creatGetProfile;
})();