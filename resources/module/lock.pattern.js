'use strict';

/**
 * Добавляет шаблоны
 */

(function () {
  const text = window.appChrome.text.blocked;
  let lastUser = null;

  const popupShow = window.appChrome.popupShow;

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

        window.appChrome.notification("suggest", text.pattern[id].term, 3);
        $(".nk-warnings-blocked").remove();

        if (text.pattern[id].warning) {
          const warning = text.pattern[id].warning;

          textarea.parent().parent().parent().after('<div class="nk-warnings-blocked nk-section nk-section_level_2"><div class="nk-warning-blocked"><span class="nk-icon nk-icon_id_warning-small nk-icon_align_auto nk-warning-blocked_alert-icon"><svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M10.504 5.726c.55-.953 1.443-.952 1.992 0l5.508 9.547c.55.953.103 1.726-.996 1.726h-11.016c-1.1 0-1.545-.774-.996-1.726l5.508-9.547z" fill="#FFB000"></path><path fill="#fff" d="M11 9h1v4h-1zM11 14h1v1h-1z"></path></svg></span>' + warning.title + '<span class="nk-icon nk-icon_id_help-small nk-icon_align_auto nk-system__info-icon"><svg xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd" transform="scale(0.7) translate(5, 5)"><path d="M11 21c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm0-1.8c4.529 0 8.2-3.671 8.2-8.2s-3.671-8.2-8.2-8.2-8.2 3.671-8.2 8.2 3.671 8.2 8.2 8.2zM10.885 6.048c.956 0 1.751.229 2.384.686.633.457.949 1.134.949 2.031 0 .55-.138 1.014-.413 1.39-.161.229-.47.521-.927.876l-.451.349c-.245.19-.408.413-.489.667-.051.161-.078.41-.083.749h-1.714c.025-.715.093-1.209.203-1.482.11-.273.394-.587.851-.943l.463-.362c.152-.114.275-.239.368-.375.169-.233.254-.489.254-.768 0-.322-.094-.615-.282-.879-.188-.264-.532-.397-1.031-.397-.491 0-.839.163-1.044.489-.205.326-.308.664-.308 1.016h-1.834c.051-1.206.472-2.061 1.263-2.564.499-.322 1.113-.482 1.841-.482zM10 14h2v2h-2v-2z"></path></g></svg></span></div></div>');

          $(".nk-warnings-blocked .nk-icon_id_help-small").hover(() => {
            popupShow($(".nk-warnings-blocked .nk-icon_id_help-small"), warning.gaid);
          }, () => {
            $(".nk-portal-local .nk-popup").removeClass("nk-popup_visible");
          });
        }
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
    }
  });

  /**
   * Инициализация создания ожидания открытия блока блокировки
   */

  const creatLockPattern = () => {
    if (!window.appChrome.startStatus) return;

    const appViewElement = document.querySelector(".nk-app-view");
    editAppView.observe(appViewElement, {childList: true});
  };

  window.appChrome.init.lockPattern = creatLockPattern;
})();