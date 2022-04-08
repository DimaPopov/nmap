'use strict';

/**
 * Добавляет шаблоны
 */

(function () {
  const text = window.appChrome.text.blocked;
  let lastUser = null;

  let countBan = 0;

  const showBlocked = () => {
    if (!window.appChrome.startStatus) return;

    $(".nk-portal-lock-pattern").remove();
    $("body").append('<div class="nk-portal nk-portal-lock-pattern"><!----><div class="nk-popup nk-popup_direction_bottom-center nk-popup_theme_islands" style="left: 783.242px; top: 242px; z-index: 1001;"><div class="nk-size-observer"><div class="nk-popup__content"><div class="nk-menu nk-menu_theme_islands nk-menu_size_s" tabindex="0"><div class="nk-menu__group" role="group"><div class="nk-menu__group-title" role="presentation">' + text.portal.title + '</div></div></div></div></div></div><!----><!----><!----></div>');

    const portal = $(".nk-portal-lock-pattern .nk-popup");
    const patternElement = $("body .nk-portal-lock-pattern .nk-menu__group");
    text.portal.pattern.forEach((pattern, id) => {
      patternElement.append('<div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_s">' + pattern + '</div>');

      const activeElement = patternElement.find(".nk-menu-item:last-child");

      activeElement.hover(() => {
        activeElement.addClass("nk-menu-item_hovered");
      }, () => {
        activeElement.removeClass("nk-menu-item_hovered");
      });

      activeElement.on("click", () => {
        const nameUser = $(".nk-user-profile-view .nk-user-profile-view__header .nk-user-profile-view__name").text().split(" ")[0];
        const textarea = $(".nk-user-profile-view .nk-ban-form-view .nk-text-area__control");

        textarea.css("height", text.pattern[id].height)
        textarea.text((text.pattern[id].text + text.pattern_end).replaceAll("{user_name}", nameUser));

        textarea[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
        textarea[0].dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
        textarea[0].dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        textarea[0].dispatchEvent(new Event('input', { bubbles: true }));
        textarea[0].dispatchEvent(new Event('change', { bubbles: true }));

        portal.removeClass("nk-popup_visible");

        const term = countBan >= 2 ? 7 : text.pattern[id].term;

        window.appChrome.notification("suggest", "Не забудьте указать срок блокировки, рекомендуемый — " + term, 3);
      });
    });

    setTimeout(() => {
      const banForm = $(".nk-user-profile-view .nk-ban-form-view");
      let buttonBlock = banForm.find(".nk-grid:nth-child(1) .nk-grid__col_span_8");

      buttonBlock.append('<button class="nk-button nk-button-lock-pattern nk-button_theme_islands nk-button_size_m nk-user-profile-view__action" type="button"><span class="nk-button__text">' + text.button + '</span></button>');
      buttonBlock = buttonBlock.find(".nk-button-lock-pattern");

      buttonBlock.on("click", () => {
        portal.css("left", window.innerWidth - (window.innerWidth - buttonBlock.offset().left) - buttonBlock.width() - 23);

        setTimeout(() => buttonBlock.removeClass("nk-button_pressed"), 100);
        portal.toggleClass("nk-popup_visible");
      });

      buttonBlock.hover(() => {
        buttonBlock.addClass("nk-button_hovered");
      }, () => {
        buttonBlock.removeClass("nk-button_hovered");
      });

      buttonBlock.focus(() => {
        buttonBlock.addClass("nk-button_pressed");
      });

      buttonBlock.blur(() => {
        buttonBlock.removeClass("nk-button_pressed");
      });

      /* Если клик вне списка для выбора, скрыть окно */
      $(document).mouseup((e) => {
        if (!portal.is(e.target) && portal.has(e.target).length === 0) {
          portal.removeClass("nk-popup_visible");
        }
      });
    }, 15);
  };

  /**
   * Отслеживание изменений в окне редактора
   *
   * @type {MutationObserver}
   */

  const editAppView = new MutationObserver(() => {
    if (!window.appChrome.startStatus) return;

    const isUser = window.location.hash.indexOf("users/") !== -1;
    const userId = isUser ? window.location.hash.split("users/")[1].split("?")[0] : null;

    if (isUser && userId) {
      const buttonLock = $(".nk-user-profile-view .nk-user-profile-view__header .nk-user-profile-view__actions .nk-user-profile-view__action:nth-child(2)");
      if (!buttonLock) {
        $(".nk-portal-lock-pattern").remove();
        lastUser = null;

        return;
      }

      const buttonLockText = buttonLock.text();
      if (buttonLockText !== "Заблокировать") {
        $(".nk-portal-lock-pattern").remove();
        lastUser = null;

        return;
      }

      if (lastUser === userId) return;
      lastUser = userId;

      buttonLock.on("click", showBlocked);

      const hesh_user = window.location.href.replace("https://n.maps.yandex.ru/#!/", "");
      const publicID = hesh_user.split("/")[1].split("?")[0];

      const config = JSON.parse($("#config").text());
      const data = [
        {
          "method": "acl/getBanHistory",
          "params": {
            "userPublicId": publicID,
            "token": JSON.parse(localStorage.getItem("nk:token")),
          }
        },
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
          if (response.data[0].error) return;

          const info = response.data[0].data;
          countBan = 0;

          info.forEach((value) => {
            if (value.action === "ban") countBan++;
          });
        }
      });
    }
  });

  /**
   * Инициализация создание ожидания открытия блока блокировки
   */

  const creatLockPattern = () => {
    if (!window.appChrome.startStatus) return;

    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.lockPattern = creatLockPattern;
})();