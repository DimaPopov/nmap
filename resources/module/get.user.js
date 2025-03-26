'use strict';

/**
* Добавляет возможность поиска пользователей
*/

(function () {
  let settingUser = {};

  chrome.storage.local.get(["nkSetting-getUser"], (result) => {
    if (!result["nkSetting-getUser"]) {
      const default_setting = {
        'view': {
          'total-edits': true,
          'rating-pos-full': true,
          'feedback-count': true,
          'category-group': false,
        }
      };

      chrome.storage.local.set({ "nkSetting-getUser": default_setting });
      settingUser = default_setting;
    }else {
      settingUser = result["nkSetting-getUser"];
    }
  });

  /* Магические значения, необходимые для корректного отображения интерфейса */
  const MAGIC_HEIGHT = 218;
  const MAGIC_TOP_WINDOW = 180;
  const MAGIC_LEFT_CLOSE = MAGIC_TOP_WINDOW - 55;
  
  const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
  let lastUserID = 0;
  let isCountUser = false;
  let isLoad = true;

  const text = window.appChrome.text.getUser;
  const creatElement = window.appChrome.creatElement;
  const popupShow = window.appChrome.popupShow;

  /**
   * Форматирование даты
   * @param date - Перевод даты в русскоязычную
   * @returns {string}
   */

  const formatDate = (date) => {    
    let day = date.getDate();
    let month_text = month[date.getMonth()];
    let year = date.getFullYear() % 10000;

    return day + ' ' + month_text + ' ' + year;
  }


  /**
   * Скрытие дополнительных инструментов
   */

  const hideToolsMenu = () => {
    const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");

    /* Используется click по кнопке вызова меню, а не remove или classList, так как их использование ломает Народную карту */
    toolsButton.click();
  };


  /**
   * Скрытие окна поиска пользователей
   */

  const hideView = () => {
    const viewElement = $(".nk-get-user-view");
    const objectViewElement = $(".nk-geoobject-viewer-view");

    window.location.hash = "?" + window.location.hash.split("?")[1].split("%23sat")[0] + "%23sat";
    
    document.removeEventListener("keyup", hideViewKeyup);
    viewElement.remove();

    objectViewElement.css("display", "unset");
  };
    
  const hideViewKeyup = (e) => {
    if (e.key !== "Escape") return;
    
    const objectViewElement = document.querySelector(".nk-get-user-view");
    if (!objectViewElement) return;
    
    hideView();
  };


  /**
   * Открытие карточки пользователя для детальной информации
   *
   * @param e
   */

  const showItemUser = (e) => {
    if (!window.appChrome.startStatus) return;

    const showElement = $(e.delegateTarget);
    const activeElement = $(".nk-get-user-view .nk-scrollable__content .nk-size-observer .nk-list-item-view.nk-list-item-view_expanded");
    
    if (!!activeElement[0]) {
      activeElement.removeClass("nk-list-item-view_expanded");
      activeElement.addClass("nk-list-item-view_interactive");
      
      activeElement.on("click", showItemUser);
    }
    
    showElement.removeClass("nk-list-item-view_interactive");
    showElement.addClass("nk-list-item-view_expanded");

    if (showElement.attr("data-id")) {
      setTimeout(() => {
        showElement.find(".nk-link-user").attr("href", "/#!/users/" + showElement.attr("data-id"));
        showElement.find(".nk-link-user").removeClass("nk-user-link-view_disabled");
      }, 10);
    }

    showElement.off("click", showItemUser);
  };


  /**
   * Отображение списка пользователей
   *
   * @param users - Список пользователей
   * @param isUpdate - Подгружать список или обновить _true/false_
   */
  
  const renderUsersList = (users, isUpdate = false) => {
    if (!window.appChrome.startStatus) return;
    const config = window.appChrome.config;

    const observer = $(".nk-get-user-view .nk-scrollable__content .nk-size-observer");

    if (!isUpdate) {
      observer.html("<div class='nk-list-view__items'></div>");
    }
    
    const parent = observer.find(".nk-list-view__items");

    users.forEach((user) => {
      const viewElements = {};
      lastUserID = user.id;
      
      viewElements.parentHome = creatElement(parent, ["nk-list-item-view", "nk-list-item-view_interactive"], ".nk-list-item-view:last-child");
      viewElements.parentHome.attr("data-id", user.publicId);

      viewElements.parent = creatElement(viewElements.parentHome, ["nk-list-item-info-user", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user");
      viewElements.parent = creatElement(viewElements.parent, ["nk-list-item-info-user__content", "nk-grid"], ".nk-list-item-info-user__content");

      viewElements.iconParent = creatElement(viewElements.parent, ["nk-info-user__icon", "nk-grid__col", "nk-grid__col_span_2"], ".nk-info-user__icon");
      viewElements.icon = creatElement(viewElements.iconParent, ["nk-user-icon", "nk-user-icon_size_middle"], ".nk-user-icon");
            
      viewElements.icon.css("background-image", "url(https://avatars.mds.yandex.net/get-yapic/" + user.avatarId + "/islands-middle)");
      
      viewElements.content = creatElement(viewElements.parent, ["nk-grid__col", "nk-grid__col_span_10", "nk-grid__col_stick"], ".nk-grid__col_stick");
      
      viewElements.nameParent = creatElement(viewElements.content, ["nk-info-user__user-content", "nk-grid"], ".nk-info-user__user-content");      
      viewElements.nameContent = creatElement(viewElements.nameParent, ["nk-info-user__user-name"], ".nk-info-user__user-name");
      viewElements.name = creatElement(viewElements.nameContent, ["nk-info-user__user"], ".nk-info-user__user");

      let icon = "";
      let textIcon = "";
      
      if (user.yandex) {
        icon = '<span class="nk-icon nk-icon_id_yandex nk-icon_align_auto nk-user-name-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><path d="M2,2 L16,2 L21,11 L16,20 L2,20 L2,2 Z" fill="#FFCC00"></path><path d="M11.0107422,15 L11.0107422,11.7128906 C11.0107422,11.7128906 10.8335785,11.7880852 10.6276856,11.9384766 C10.4217926,12.0888679 10.0699895,12.538245 9.57226563,13.2866211 L8.42285157,15 L6.52148438,15 L7.38291016,13.46 C7.76246935,12.8551402 7.96503794,12.4281425 8.190625,12.1828613 C8.41621207,11.9375802 8.59908684,11.7182627 8.93925782,11.5249023 C8.20520467,11.4103184 7.67526205,11.155194 7.34941407,10.7595215 C7.02356608,10.3638489 6.86064453,9.89030224 6.86064453,9.33886719 C6.86064453,8.85904708 6.98149294,8.43383974 7.22319336,8.06323242 C7.46489379,7.6926251 7.7835755,7.34376691 8.17924805,7.21665039 C8.5749206,7.08953387 8.96663018,7.02597656 9.75439453,7.02597656 L13.0005859,7.02597656 L13.0005859,15 L11.0107422,15 Z M11.0107422,8.45800781 C11.0107422,8.45800781 9.7253428,8.47233059 9.52661134,8.50097656 C9.32787987,8.52962254 9.15690177,8.62630126 9.01367188,8.79101562 C8.870442,8.95572999 8.79882813,9.17057159 8.79882813,9.43554688 C8.79882813,9.7112644 8.86775648,9.93058187 9.00561524,10.0935059 C9.143474,10.2564299 9.31892798,10.3575844 9.53198243,10.3969727 C9.74503688,10.4363609 11.0107422,10.4560547 11.0107422,10.4560547 L11.0107422,8.45800781 Z" fill="#664C0E"></path></g></svg></span>';
        textIcon = 'Сотрудник Яндекса';
      }else if (user.moderationStatus === "moderator") {
        icon = '<span class="nk-icon nk-icon_id_moderator nk-icon_align_auto nk-user-name-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L16,2 L21,11 L16,20 L2,20 L2,2 Z" fill="#FFCC00"></path><path d="M6,15 L6,7 L8.7,7 L10,13 L11.3,7 L14,7 L14,15 L12,15 L12,9 L10.7,15 L9.3,15 L8,9 L8,15 L6,15 Z" id="М-3" fill="#664C0E"></path></svg></span>';
        textIcon = 'Модератор';
      }else if (user.status === "banned") {
        icon = '<span class="nk-icon nk-icon_id_banned nk-icon_align_auto nk-user-name-view__icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g transform="translate(4 4)" fill="none"><circle fill="#FC5A5C" cx="7" cy="7" r="7"></circle><path fill="#fff" d="M2 6h10v2h-10z"></path></g></svg></span>';
        textIcon = 'Заблокирован';
      }else if (user.status !== "deleted" && (user.trustLevel === "novice" || user.trustLevel === "afterBan")) {
        icon = '<span class="nk-icon nk-icon_id_untrusted nk-icon_align_auto nk-user-name-view__icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill="none"><path d="M8.667 10.13h1.212l1.252 2.951 1.069-2.951h1.132l-1.813 4.32c-.198.468-.399.824-.604 1.068-.205.244-.47.366-.795.366-.32 0-.57-.022-.751-.066v-.853l.417.016c.251 0 .432-.048.54-.145.109-.097.213-.306.313-.626l-1.974-4.079z" fill="#4A4A4A"></path><path d="M10.047 3.69c.527-.966 1.381-.964 1.907 0l6.846 12.565c.527.966.061 1.75-1.055 1.75h-13.489c-1.109 0-1.58-.786-1.055-1.75l6.846-12.565z" stroke="#FC5A5C"></path></g></svg></span>';
        textIcon = user.trustLevel === "novice" ? 'Новичок' : 'Недавно разблокирован';
      }else if (user.moderationStatus === "expert") {
        icon = '<span class="nk-icon nk-icon_id_expert nk-icon_align_auto nk-user-name-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M18,11.634 L18,9.109 L19,8.652 L11,5 L3,8.652 L11,12.304 L17,9.565 L17,11.634 C16.701,11.807 16.5,12.13 16.5,12.5 C16.5,13.052 16.948,13.5 17.5,13.5 C18.052,13.5 18.5,13.052 18.5,12.5 C18.5,12.13 18.299,11.807 18,11.634 L18,11.634 Z M16,11.103 L11,13.348 L6,11.103 L6,14.392 C6,14.392 6,17.001 11,17.001 C16,17.001 16,14.392 16,14.392 L16,11.103 Z" fill="#8FCB69"></path></svg></span>';
        textIcon = 'Эксперт';
      }
      
      
      const iconClass = !!icon ? " nk-user-link-view_has-icon" : ""; 
      const deleteUserClass = user.status === "deleted" ? "nk-user-name-view_deleted" : "nk-user-name-view_colored";
            
      viewElements.name.html('<a role="link" aria-disabled="false" class="nk-link nk-link-user nk-link_theme_islands nk-user-link-view_disabled nk-user-link-view' + iconClass + '"><span class="nk-user-name-view ' + deleteUserClass + '"><span class="nk-user-name-view__name">' + user.displayName + '</span>' + icon + '</span></a>');
      creatElement(viewElements.nameContent, ["nk-info-user__user--login"], ".nk-info-user__user--login", user.login);
      
      if (user.status === "deleted") {
        viewElements.delite = creatElement(viewElements.nameParent, ["nk-event-view__date-and-action", "nk-info-user__user-badge"], ".nk-event-view__date-and-action");
        viewElements.delite = creatElement(viewElements.delite, ["nk-badge", "nk-badge_color_red", "nk-event-view__badge"], ".nk-badge.nk-badge_color_red", text.view.deleteUser);
      }else if (user.outsourcer) {
        viewElements.warningAction = creatElement(viewElements.nameParent, ["nk-event-view__date-and-action", "nk-info-user__user-badge"], ".nk-event-view__date-and-action");
        viewElements.warningAction = creatElement(viewElements.warningAction, ["nk-badge", "nk-badge_color_yellow", "nk-event-view__badge"], ".nk-badge.nk-badge_color_red", "аутсорсер");
      }

      if (!!icon.length) {
        const iconRole = viewElements.name.find(".nk-link .nk-icon");
        popupShow(iconRole, textIcon);
      }
            
      viewElements.parentDetals = creatElement(viewElements.parentHome, ["nk-list-item-info-user_details", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user_details");
      viewElements.parentStart = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user_details-block:last-child");
      
      viewElements.parent = viewElements.parentStart;
      
      /* Добавление даты регистрации */
      const date = new Date(user.createdAt);
      let creatDate = formatDate(date);

      const todayDate = formatDate(new Date());
      const yesterdayDate = formatDate(new Date(Date.now()-86400000));

      creatDate = todayDate === creatDate ? 'сегодня' : creatDate;
      creatDate = yesterdayDate === creatDate ? 'вчера' : creatDate;

      creatDate +=  ' в ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
      
      viewElements.info = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");
      creatElement(viewElements.info, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.createdAt);

      viewElements.info = creatElement(viewElements.info, ["nk-info-user__text"], ".nk-info-user__text", creatDate);
      viewElements.parent = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user_details-block:last-child");

      /* Добавление информации о должности, если это аутсорсер */
      if (user.outsourcer) {
        $('<div class="nk-info-user__info nk-info-user__info-role"></div>').prependTo(viewElements.parent);
        viewElements.info = viewElements.parent.find(".nk-info-user__info-role");
        
        creatElement(viewElements.info, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.yndx);

        viewElements.info = creatElement(viewElements.info, ["nk-info-user__text"], ".nk-info-user__text", "Аутсорсер");
        
        viewElements.parentRole = viewElements.parent;
        viewElements.parent = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user_details-block:last-child");
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
          },
          {
            "method": "acl/getUser",
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
            if (!window.appChrome.startStatus) return;

            let parent;
            let localParent;

            const stats = response.data[0].error ? false : response.data[0].data.stats;
            const infoRoleGroup = response.data[1].error ? false : response.data[1].data;
            const infoProfile = response.data[2].error ? false : response.data[2].data;

            /* Проверка наличия прав в схемах помещений */

            if (stats) {
              const indoor = stats.editStats.categoryGroups.indoor_group;

              if (indoor.new > 0 || indoor.total > 0) {
                if (!viewElements.infoAccess) {
                  viewElements.infoAccess = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                  creatElement(viewElements.infoAccess, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.access);
                  viewElements.infoAccess = creatElement(viewElements.infoAccess, ["nk-info-user__access", "nk-grid"], ".nk-info-user__access");
                }

                viewElements.infoAccess.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_indoor-group"></span>');

                const groupIcon = viewElements.infoAccess.find(".nk-user-stat-badge-view_id_indoor-group");
                popupShow(groupIcon, "Схемы помещений");
              }
            }


            /* Проверка наличия прав в нитках транспорта */

            if (infoRoleGroup) {
              const experts = infoRoleGroup.expertExpertise;

              if (experts) {
                experts.forEach((expert) => {
                  if (expert === "transport_group") {
                    if (!viewElements.infoAccess) {
                      viewElements.infoAccess = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                      creatElement(viewElements.infoAccess, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.access);
                      viewElements.infoAccess = creatElement(viewElements.infoAccess, ["nk-info-user__access", "nk-grid"], ".nk-info-user__access");
                    }

                    viewElements.infoAccess.append('<span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_transport-group"></span>');

                    const groupIcon = viewElements.infoAccess.find(".nk-user-stat-badge-view_id_transport-group");
                    popupShow(groupIcon, "Нитки транспорта");
                  }
                });
              }
            }

            /* Добавление информации о том, кто заблокировал пользователя */
            if (user.status === "banned") {
              let date = new Date(infoProfile.banRecord.createdAt);
              let creatBannedDate = formatDate(date);

              let creatBannedDateAll = creatBannedDate;
              creatBannedDateAll +=  ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

              if (infoProfile.banRecord.expiresAt) {
                date = new Date(infoProfile.banRecord.expiresAt);
                let expiresBannedDate = formatDate(date);

                let expiresBannedDateAll = expiresBannedDate;
                expiresBannedDateAll +=  ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
              }

              viewElements.info = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

              creatElement(viewElements.info, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.banned.time);
              viewElements.info = creatElement(viewElements.info, ["nk-info-user__text"], ".nk-info-user__text");

              viewElements.info.html(infoProfile.banRecord.expiresAt ? "c <span class='nk-creat-banned-date'>" + creatBannedDate + "</span> по <span class='nk-expires-banned-date'>" + expiresBannedDate + "</span>" : "Бессрочно c <span class='nk-creat-banned-date'>" + creatBannedDate + "</span>");

              const creatBannedDateElement = viewElements.info.find(".nk-creat-banned-date");
              popupShow(creatBannedDateElement, creatBannedDateAll);

              const expiresBannedDateElement = viewElements.info.find(".nk-expires-banned-date");
              if (expiresBannedDateElement) {
                popupShow(expiresBannedDateElement, expiresBannedDateAll);
              }

              ///////

              viewElements.info = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

              creatElement(viewElements.info, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.banned.user);
              viewElements.info = creatElement(viewElements.info, ["nk-info-user__text"], ".nk-info-user__text");

              let icon;
              let textIcon;

              if (infoProfile.banRecord.createdBy.yandex) {
                icon = '<span class="nk-icon nk-icon_id_yandex nk-icon_align_auto nk-user-name-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><path d="M2,2 L16,2 L21,11 L16,20 L2,20 L2,2 Z" fill="#FFCC00"></path><path d="M11.0107422,15 L11.0107422,11.7128906 C11.0107422,11.7128906 10.8335785,11.7880852 10.6276856,11.9384766 C10.4217926,12.0888679 10.0699895,12.538245 9.57226563,13.2866211 L8.42285157,15 L6.52148438,15 L7.38291016,13.46 C7.76246935,12.8551402 7.96503794,12.4281425 8.190625,12.1828613 C8.41621207,11.9375802 8.59908684,11.7182627 8.93925782,11.5249023 C8.20520467,11.4103184 7.67526205,11.155194 7.34941407,10.7595215 C7.02356608,10.3638489 6.86064453,9.89030224 6.86064453,9.33886719 C6.86064453,8.85904708 6.98149294,8.43383974 7.22319336,8.06323242 C7.46489379,7.6926251 7.7835755,7.34376691 8.17924805,7.21665039 C8.5749206,7.08953387 8.96663018,7.02597656 9.75439453,7.02597656 L13.0005859,7.02597656 L13.0005859,15 L11.0107422,15 Z M11.0107422,8.45800781 C11.0107422,8.45800781 9.7253428,8.47233059 9.52661134,8.50097656 C9.32787987,8.52962254 9.15690177,8.62630126 9.01367188,8.79101562 C8.870442,8.95572999 8.79882813,9.17057159 8.79882813,9.43554688 C8.79882813,9.7112644 8.86775648,9.93058187 9.00561524,10.0935059 C9.143474,10.2564299 9.31892798,10.3575844 9.53198243,10.3969727 C9.74503688,10.4363609 11.0107422,10.4560547 11.0107422,10.4560547 L11.0107422,8.45800781 Z" fill="#664C0E"></path></g></svg></span>';
                textIcon = 'Сотрудник Яндекса';
              }else if (infoProfile.banRecord.createdBy.moderationStatus === "moderator") {
                icon = '<span class="nk-icon nk-icon_id_moderator nk-icon_align_auto nk-user-name-view__icon"><svg width="22px" height="22px" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L16,2 L21,11 L16,20 L2,20 L2,2 Z" fill="#FFCC00"></path><path d="M6,15 L6,7 L8.7,7 L10,13 L11.3,7 L14,7 L14,15 L12,15 L12,9 L10.7,15 L9.3,15 L8,9 L8,15 L6,15 Z" id="М-3" fill="#664C0E"></path></svg></span>';
                textIcon = 'Модератор';
              }else if (infoProfile.banRecord.createdBy.moderationStatus === "robot") {
                icon = '<span class="nk-icon nk-icon_id_moderator nk-icon_align_auto nk-user-name-view__icon"><svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg"><path d="m6.5 1c-.55228 0-1 .44772-1 1 0 .37014.2011.69331.5.86622v2.13378h-4v13h14v-13h-1v-2.13378c.2989-.17291.5-.49608.5-.86622 0-.55228-.4477-1-1-1s-1 .44772-1 1c0 .37014.2011.69331.5.86622v2.13378h-7v-2.13378c.2989-.17291.5-.49608.5-.86622 0-.55228-.44772-1-1-1z" fill="#fc0"></path><g fill="#664c0e"><path d="m4 10h2v1h1v2h-3z"></path><path d="m6 15h6c0 .5523-.4477 1-1 1h-4c-.55228 0-1-.4477-1-1z"></path><path d="m13 10h-2v3h3v-2h-1z"></path></g><path d="m16 5h4v13h-4z" fill="#f0bf01"></path></svg></span>';
                textIcon = 'Робот';
              }

              const iconClass = !!icon ? " nk-user-link-view_has-icon" : "";

              viewElements.info.html('<a role="link" aria-disabled="false" class="nk-link nk-link-banned nk-link-user nk-user-link-view_colored nk-link_theme_islands nk-user-link-view' + iconClass + '" href="/#!/users/' + infoProfile.banRecord.createdBy.publicId + '"><span class="nk-user-name-view nk-user-name-view_colored"><span class="nk-user-name-view__name">' + infoProfile.banRecord.createdBy.displayName + '</span>' + icon + '</span></a>');

              if (!!icon.length) {
                const iconRole = viewElements.info.find(".nk-link-banned .nk-icon");
                popupShow(iconRole, textIcon);
              }

              ///////

              viewElements.info = creatElement(viewElements.parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

              creatElement(viewElements.info, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info.banned.reason);
              viewElements.info = creatElement(viewElements.info, ["nk-info-user__text"], ".nk-info-user__text", infoProfile.banRecord.reason);

              viewElements.info.css({ 'white-space': 'pre-wrap', 'word-break': 'break-word' });

              viewElements.parentRole = viewElements.parent;
              viewElements.parent = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-section", "nk-section_level_2"], ".nk-list-item-info-user_details-block:last-child");
            }


            if (stats && infoRoleGroup) {
              viewElements.parentDetals.find(".nk-list-item-info-user_details-block.nk-profile-info").remove();

              parent = viewElements.parentDetals.find(".nk-list-item-info-user_details-block:first-child");
              parent.after('<div class="nk-list-item-info-user_details-block nk-profile-info nk-section nk-section_level_2"></div>');

              parent = viewElements.parentDetals.find(".nk-list-item-info-user_details-block.nk-profile-info");
              /* Место в рейтинге */
              if (settingUser.view["rating-pos-full"]) {
                localParent = creatElement(parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                creatElement(localParent, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info["rating-pos-full"]);
                creatElement(localParent, ["nk-info-user__info--text"], ".nk-info-user__info--text", new Intl.NumberFormat('ru-RU').format(stats.ratingPosFull));
              }

              /* Число правок */
              if (settingUser.view["total-edits"]) {
                localParent = creatElement(parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                creatElement(localParent, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info["total-edits"]);
                creatElement(localParent, ["nk-info-user__info--text"], ".nk-info-user__info--text", new Intl.NumberFormat('ru-RU').format(stats.totalEdits));
              }

              /* Разобрано неточностей */
              if (settingUser.view["feedback-count"]) {
                localParent = creatElement(parent, ["nk-info-user__info"], ".nk-info-user__info:last-child");

                creatElement(localParent, ["nk-info-user__info--title"], ".nk-info-user__info--title", text.view.info["feedback-count"]);
                creatElement(localParent, ["nk-info-user__info--text"], ".nk-info-user__info--text", new Intl.NumberFormat('ru-RU').format(stats.resolvedFeedbackCount));
              }

              /* Информация о правках в слоях */
              if (settingUser.view["category-group"]) {
                if (stats.totalEdits === 0) {
                  viewElements.parentDetals.find(".nk-category-group").remove();

                  parent = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-section_level_2", "nk-section", "nk-category-group"], ".nk-list-item-info-user_details-block:last-child");
                  creatElement(parent, ["nk-info-user__info", "nk-info-user__info-text"], ".nk-info-user__info:last-child", text.view.info.noCategoryGroup);
                }else {
                  viewElements.parentDetals.find(".nk-category-group").remove();

                  parent = creatElement(viewElements.parentDetals, ["nk-list-item-info-user_details-block", "nk-category-group", "nk-section"], ".nk-category-group");
                  parent.css("padding", "0 12px 15px");

                  for (const categoryName in stats.editStats.categoryGroups) {
                    const categoryValue = stats.editStats.categoryGroups[categoryName];

                    /* Генерация шаблона информации о слое */
                    let groupElement = creatElement(parent, ["nk-user-stat-view__category-group"], ".nk-user-stat-view__category-group:last-child")
                    groupElement = creatElement(groupElement, ["nk-user-stat-category-group-view"], ".nk-user-stat-category-group-view");

                    groupElement.append('<span class="nk-user-stat-category-group-view__category-group"><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_' + categoryName.replaceAll("_", "-") + '"></span></span>');
                    groupElement.append('<span class="nk-user-stat-category-group-view__stats"><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_expert-disabled"></span><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_moderator-disabled"></span><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_edits"></span></span>');

                    const expertIcon = groupElement.find(".nk-user-stat-badge-view_id_expert-disabled");
                    const moderatorIcon = groupElement.find(".nk-user-stat-badge-view_id_moderator-disabled");

                    let number = new Intl.NumberFormat('ru-RU').format(categoryValue.total);

                    if (categoryValue.total >= 1000000) {
                      number = number.split(' ')[0] + " " + number.split(' ')[1] + "k";
                    } else if (categoryValue.total >= 100000) {
                      number = number.split(' ')[0] + "k";
                    }

                    groupElement.find(".nk-user-stat-category-group-view__stats").append(number);

                    if (categoryValue.total === 0) {
                      groupElement.addClass("nk-user-stat-category-group-view_disabled");
                    }

                    if (infoRoleGroup.expertExpertise && infoRoleGroup.expertExpertise.indexOf(categoryName) !== -1) {
                      expertIcon.removeClass("nk-user-stat-badge-view_id_expert-disabled");
                      expertIcon.addClass("nk-user-stat-badge-view_id_expert");
                    }

                    if (infoRoleGroup.moderatorExpertise) {
                      infoRoleGroup.moderatorExpertise.forEach((moderatorExpert) => {
                        if (moderatorExpert.categoryGroupIds.indexOf(categoryName) !== -1) {
                          moderatorIcon.removeClass("nk-user-stat-badge-view_id_moderator-disabled");
                          moderatorIcon.addClass("nk-user-stat-badge-view_id_moderator");

                          return false;
                        }
                      });
                    }
                  }

                  let groupElement = creatElement(parent, ["nk-user-stat-view__category-group"], ".nk-user-stat-view__category-group:last-child")
                  groupElement = creatElement(groupElement, ["nk-user-stat-category-group-view"], ".nk-user-stat-category-group-view");

                  groupElement.append('<span class="nk-user-stat-category-group-view__category-group"><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_group-edits"></span></span>');
                  groupElement.append('<span class="nk-user-stat-category-group-view__stats"><span class="nk-user-stat-badge-view nk-user-stat-badge-view_id_edits"></span></span>');

                  if (stats.editStats.group === 0) {
                    groupElement.addClass("nk-user-stat-category-group-view_disabled");
                  }

                  let number = new Intl.NumberFormat('ru-RU').format(stats.editStats.group);

                  if (stats.editStats.group >= 1000000) {
                    number = number.split(' ')[0] + " " + number.split(' ')[1] + "k";
                  } else if (stats.editStats.group >= 100000) {
                    number = number.split(' ')[0] + "k";
                  }

                  groupElement.find(".nk-user-stat-category-group-view__stats").append(number);
                }
              }
            }
          }
        });
      }
      
      viewElements.parentHome.on("click", showItemUser);
    });
  };


  /**
   * Запрос информации о пользователях
   *
   * @param after - ID последнего пользователя, если нужно подгрузить список
   */
  
  const getUser = (after = 0) => {
    if (!window.appChrome.startStatus) return;

    const config = window.appChrome.config;
    const login = $("#nk-login-get-user").val();

    if (login.length === 0) {
      $("#get-user-spinner-input").remove();
      $(".nk-get-user-view .nk-scrollable__content .nk-size-observer").html("<div class='nk-no-info-user'>" + text.view.defaultValue + "</div>");
      return;
    }
        
    const data = [
        {
          "method": "acl/getUsers",
          "params": {
            "name": login,
            "limit": 20,
            "after": after !== 0 ? after : undefined,
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
        if ($("#nk-login-get-user").val() !== login) return;
        $("#get-user-spinner-input").remove();
        
        const users = response.data[0].data.users;
        isCountUser = users.length >= 20;
        isLoad = true;

        if (users.length === 0 && !after) {
          if ($(".nk-no-info-user")[0]) {
            $(".nk-no-info-user").text(text.view.default);
          }else {
            $(".nk-get-user-view .nk-scrollable__content .nk-size-observer").html("<div class='nk-no-info-user'>" + text.view.default + "</div>");
          }

          return;
        }
                
        renderUsersList(users, !!after);
      },
      error: function () {
        window.appChrome.notification("error", text.notification.error.default);
        hideView();
      }
    });
  };


  /**
   * Подгрузка пользователей, если их больше 20-ти
   */

  const scrollLoad = () => {
    if (!isCountUser || !isLoad || !window.appChrome.startStatus) return;
    
    const scrollElement = $(".nk-get-user-view .nk-scrollable__container");
    const scrollContentElement = scrollElement.find(".nk-scrollable__content");
    
    const scrollActive = scrollElement.scrollTop();
    const scrollMax = scrollContentElement.height() - (window.innerHeight - MAGIC_HEIGHT) - 500;
        
    if (scrollActive >= scrollMax) {
      isLoad = false;
      getUser(lastUserID);
    }
  };
  
  
  /**
  * Открытие окна поиска пользователей
  */
  
  const showViewGetUser = (isEdit = true) => {
    if (!window.appChrome.startStatus) return;
    hideToolsMenu();
    
    
    /* Скроем активные окна */    
    while ($(".nk-sidebar-view:not(.nk-get-user-view):not([hidden])")[0]) {
      document.querySelector('.nk-get-user-view').style.display = 'none';
    }
    
    
    isLoad = true;
    isCountUser = false;
    
    let viewElements = {};
    const getHashData = "?" + (window.location.hash.indexOf("name=") !== -1 ? window.location.hash.split("?")[1].split("&name")[0] : window.location.hash.split("?")[1]);    
    
    if (!!isEdit) {
      setTimeout(() => { window.location.hash = "!tools/get-user" + getHashData; }, 1);
    }
    
    $(".nk-app-view").append("<aside class='nk-sidebar-view nk-get-user-view nk-island'></aside>");
    
    viewElements.parent = $(".nk-get-user-view");
    viewElements.parent = creatElement(viewElements.parent, ["nk-size-observer"], ".nk-size-observer");
    
    // Заголовок окна
    viewElements.header = {};
    
    viewElements.header.parent = creatElement(viewElements.parent, ["nk-sidebar-header-view", "nk-grid", "nk-section", "nk-section_level_1"], ".nk-sidebar-header-view");
   
    viewElements.header.title = creatElement(viewElements.header.parent, ["nk-sidebar-header-view__title", "nk-sidebar-header-view__title_centered", "nk-grid__col", "nk-grid__col_shift_1", "nk-grid__col_span_10"], ".nk-sidebar-header-view__title");
    viewElements.header.title = creatElement(viewElements.header.title, ["nk-sidebar-header-view__title-text"], ".nk-sidebar-header-view__title-text", text.view.title); 
    
    viewElements.header.viewClose = creatElement(viewElements.header.parent, ["nk-sidebar-header-view__close", "nk-grid__col"], ".nk-sidebar-header-view__close");
    viewElements.header.viewClose.html('<span class="nk-icon nk-icon_id_close nk-icon_align_auto nk-icon_interactive"><svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="m9.58579 11-5.43934-5.43934c-.19527-.19526-.19527-.51184 0-.70711l.7071-.7071c.19527-.19527.51185-.19527.70711 0l5.43934 5.43934 5.4393-5.43934c.1953-.19527.5119-.19527.7071 0l.7072.7071c.1952.19527.1952.51185 0 .70711l-5.4394 5.43934 5.4394 5.4393c.1952.1953.1952.5119 0 .7071l-.7072.7072c-.1952.1952-.5118.1952-.7071 0l-5.4393-5.4394-5.43934 5.4394c-.19526.1952-.51184.1952-.70711 0l-.7071-.7072c-.19527-.1952-.19527-.5118 0-.7071z"></path></svg></span>');

    let popup = $(".nk-portal-local .nk-popup");

    viewElements.header.viewClose.on('click', () => {
		hideView();
		popup.removeClass("nk-popup_visible");
	});
    viewElements.header.viewClose.hover(() => {
      popup.css({ "left": window.innerWidth - MAGIC_LEFT_CLOSE + "px", "top": "105px" });
      popup.find(".nk-popup__content").text("Закрыть (Esc)");
      popup.addClass("nk-popup_visible");
    }, () => {
      popup.removeClass("nk-popup_visible");
    });

    // Содержимое окна
    viewElements.content = {};
    
    viewElements.content.parent = creatElement(viewElements.parent, ["nk-section", "nk-section_level_1", "nk-content"], ".nk-content");
    
    viewElements.content.filterParent = creatElement(viewElements.content.parent, ["nk-get-user-view__filters", "nk-section", "nk-section_level_1"], ".nk-get-user-view__filters");
    
    /* Логин или ник */
    viewElements.content.filterText = creatElement(viewElements.content.filterParent, ["nk-text-input", "nk-text-input_login", "nk-text-input_theme_islands", "nk-text-input_size_m", "nk-text-input_width_available"], ".nk-text-input_login");
    viewElements.content.filterText.html('<input id="nk-login-get-user" class="nk-text-input__control" dir="auto" placeholder="Введите ник или логин" autocomplete="off">');
    
    const inputLogin = viewElements.content.filterText.find("#nk-login-get-user");
    
    inputLogin.focus(() => {
      viewElements.content.filterText.addClass("nk-text-input_focused");
    });
    
    inputLogin.blur(() => {
      viewElements.content.filterText.removeClass("nk-text-input_focused");
    });
    
    inputLogin.on("input", () => {          
      if (!$(".nk-no-info-user")[0] && !$("#get-user-spinner-input")[0]) {
        viewElements.content.filterText.append('<span id="get-user-spinner-input" class="nk-spinner nk-spinner_theme_islands nk-spinner_size_xs"></span>');
      }else if (!$(".nk-no-info-user .nk-spinner")[0]) {
        $(".nk-no-info-user").html('<span class="nk-spinner nk-spinner_theme_islands nk-spinner_size_l"></span>');
      }
      
      const name = $("#nk-login-get-user").val();      
        
      /* Добавим параметр в url и запросим поиск */
      const getHashData = "?" + window.location.hash.split("?")[1].split("%23sat")[0] + "%23sat";
      const url = new URL(window.location.href.replace("#!", ""));
      let newHash = "!tools/get-user" + getHashData;

      if (name.length !== 0) {
        newHash += "&name=" + name;
      }

      if (url.searchParams.get('status')) {
        newHash += "&status=" + url.searchParams.get('status');
      }

      window.location.hash = newHash;      
      window.debounce(getUser)();
    });
        
    viewElements.content.parent = creatElement(viewElements.content.parent, ["nk-scrollable", "nk-scrollable_has-scroll", "nk-scrollable_with-thumb"], ".nk-scrollable");
    viewElements.content.continer = creatElement(viewElements.content.parent, ["nk-scrollable__container"], ".nk-scrollable__container");
    viewElements.content.parent = creatElement(viewElements.content.continer, ["nk-scrollable__content"], ".nk-scrollable__content");
        
    const filterHeight = viewElements.content.filterParent.height();
    viewElements.content.continer.css("max-height", window.innerHeight - filterHeight - MAGIC_HEIGHT + "px");
    
    viewElements.content.continer.scroll(scrollLoad);
    
    viewElements.content.observer = creatElement(viewElements.content.parent, ["nk-size-observer"], ".nk-size-observer");
    viewElements.content.noData = creatElement(viewElements.content.observer, ["nk-no-info-user"], ".nk-no-info-user", text.view.defaultValue);
    
    document.addEventListener("keyup", hideViewKeyup);
  };
  
  
  /**
  * Отслеживание изменений в окне редактора
  */
  
  const editAppView = new MutationObserver(() => {
    const objectViewElement =  $(".nk-sidebar-view:not(.nk-get-user-view):not([hidden])");

    /* Проверка на наличие другого окна или активной загрузки */
    if (!objectViewElement[0] || !$(".nk-get-user-view")[0]) return;

    hideView();
  });
  
  
  /**
  * Отображаем окно поиска сразу, если при запуске были переданы параметры
  */
  
  const getUserStart = (showUser) => {
    if (!window.appChrome.startStatus) return;

    showViewGetUser(false);
      
    const getHashData = "?" + window.location.hash.split("?")[1].split("%23sat")[0] + "%23sat";
    let newHash = "!tools/get-user" + getHashData;
    
    if (showUser) {
      $("#nk-login-get-user").val(showUser);
      newHash += "&name=" + showUser;
    }

    if (showUser) {
      $(".nk-get-user-view .nk-scrollable__content .nk-size-observer .nk-no-info-user").html('<span class="nk-spinner nk-spinner_theme_islands nk-spinner_size_l"></span>');
      
      getUser();
      window.location.hash = newHash;      
    }

    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };
  
  
  /**
  * Добавление кнопки в дополнительные действия
  */
  
  const creatGetUser = (toolsMenu) => {
    if (!window.appChrome.startStatus) return;

    const menuGroupUser = toolsMenu.find(".nk-menu.nk-menu_theme_islands.nk-menu_size_s.nk-tools-control-view__tools-menu-column:nth-child(2) .nk-menu__group.nk-tools-control-view__tools-menu-group:nth-child(1)");
    
    const buttonShowViewGetUser = creatElement(menuGroupUser, ["nk-menu-item", "nk-menu-item_theme_islands", "nk-menu-item_size_s", "nk-button-get-user"], ".nk-button-get-user", text.button);
    
    buttonShowViewGetUser.hover(() => {
      buttonShowViewGetUser.addClass('nk-menu-item_hovered');
    }, () => {
      buttonShowViewGetUser.removeClass('nk-menu-item_hovered');
    });

    buttonShowViewGetUser.on('click', showViewGetUser);

    try {
      const appViewElement = document.querySelector(".nk-app-view");
      editAppView.observe(appViewElement, {childList: true});
    }catch {
      window.appChrome.notification("error", "Модуль поиска пользователей не запущен");
    }
  };
  
  window.appChrome.init.getUser = creatGetUser;
  window.appChrome.getUser = getUserStart;
})();
