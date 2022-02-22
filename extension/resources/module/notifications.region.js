'use strict';

/**
 * Добавляет возможность включить уведомления о новых правках в подписках
 */

(function () {
  let regionsInfo = {};
  const text = window.appChrome.text.notificationRegion;

  let config = JSON.parse($("#config").text());
  let iconParent;

  let showListSubscriptions = false;
  let showSubscriptions = false;

  let statusRegion = true;
  let showIcon = false;

  const data = [
    {
      "method": "social/getSubscriptions",
      "params": {
        "branch": "0",
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
      if (response.error) {
        statusRegion = false;

        /* Неудалось получить информация о подписках */
        window.needNotification = {
          status: true,
          type: "error",
          text: "Не удалось получить информацию о подписках"
        };
      }else {
        if (response.data[0].data) {
          response.data[0].data.regions.forEach((region) => {
            if (!localStorage.getItem("nk-subscriptions-" + region.id)) {
              localStorage.setItem("nk-subscriptions-" + region.id + "", JSON.stringify({
                count: 0,
                check: false,
                event: 0
              }));
            }

            const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + region.id));
            const count = Number(infoRegion.count);

            regionsInfo[region.title] = region;
            regionsInfo[region.title]["count"] = count;

            if (count > 0) showIcon = true;
          });
        }
      }
    },
    error: function () {
      statusRegion = false;

      /* Неудалось получить информация о подписках */
      window.needNotification = {
        status: true,
        type: "error",
        text: "Не удалось получить информацию о подписках"
      };
    }
  });


  /**
   * Склоение слова
   *
   * @param number - Число
   * @param words - Массив слов
   * @returns {*}
   */

  const getWord = (number, words) => {
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
  }


  const checkIconCount = () => {
    let iconStatusCheck = false;

    for (const title in regionsInfo) {
      const region = regionsInfo[title];
      const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + region.id));

      region["count"] = Number(infoRegion.count);
      if (region["count"] > 0) iconStatusCheck = true;
    }

    showIcon = iconStatusCheck;
    if (!showIcon) {
      if (iconParent && iconParent.find(".nk-user-tasks-control-view__notifier")[0]) {
        iconParent.find(".nk-user-tasks-control-view__notifier").remove();
      }
    }else if (!iconParent.find(".nk-user-tasks-control-view__notifier")[0]) {
      iconParent.append('<div class="nk-user-tasks-control-view__notifier nk-user-tasks-control-view__notifier_visible"></div>');
    }
  };

  /**
   * Запрашивает информацию о правках в зонах подписки
   */

  const checkCount = () => {
    config = JSON.parse($("#config").text());
    let data = [];

    for (const title in regionsInfo) {
      const region = regionsInfo[title];
      const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + region.id));

      if (!infoRegion.check) continue;

      data.push({
        "method": "social/getFeed",
        "params": {
          "branch": "0",
          "subscriptionRegionId": region.id,
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      });
    }

    if (data.length) {
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
          response.data.forEach((info, id) => {
            const regionID = data[id].params.subscriptionRegionId;
            const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + regionID));

            const lastID = infoRegion.event;

            const region = info.data.events;
            const lastEventID = Number(region[0].id);

            if (lastID === 0) {
              localStorage.setItem("nk-subscriptions-" + regionID, JSON.stringify({
                count: 0,
                check: infoRegion.check,
                event: lastEventID
              }));
            }else {
              const eventID = Number(region.map(x => x.id).indexOf(String(lastID)));
              let countEvent = 0;

              if (eventID >= 0) {
                for (let i = 0; i < eventID; i++) {
                  if (region[i].user.id !== window.appChrome.user.id) countEvent++;
                }

                localStorage.setItem("nk-subscriptions-" + regionID, JSON.stringify({
                  count: countEvent > 0 ? countEvent : infoRegion.count,
                  check: infoRegion.check,
                  event: lastEventID
                }));
              }else if (eventID === -1) {
                localStorage.setItem("nk-subscriptions-" + regionID, JSON.stringify({
                  count: 21,
                  check: infoRegion.check,
                  event: lastEventID
                }));
              }
            }
          });

          checkIconCount();
        }
      });
    }
    setTimeout(checkCount, 60000);
  };


  /**
   * Отслеживание изменений в окне редактора
   */

  const editAppView = () => {
    setTimeout(() => {
      const url = window.location.hash.split("/");

      if (url[3] === "feeds") {
        if (url[4].split("?")[0] === "subscriptions") {
          /* Это список подписок */
          if (showListSubscriptions) return;

          showListSubscriptions = true;
          showSubscriptions = false;

          const listSubscriptions = $(".nk-subscription-regions-view__items .nk-subscription-regions-view__item");

          listSubscriptions.each(function () {
            let title;

            /* Обвернем заголовок, для далнейшей корректной работы */
            if (!$(this).find(".nk-title-region")[0]) {
              title = $(this).text();
              $(this).html("<span class='nk-title-region'>" + title + "</span>");
            }else {
              title = $(this).find(".nk-title-region").text();
            }

            if (!regionsInfo[title]) return;

            const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + regionsInfo[title].id));
            if (!infoRegion.check) return;

            /* Добавим информация о числе правок */
            if (infoRegion.count > 0) {
              if (infoRegion.count < 20) {
                $(this).append('<span class="nk-count-task-region">' + infoRegion.count + ' ' + getWord(infoRegion.count, ['новая правка', 'новые правок', 'новых правок']) + '</span>');
              }else {
                $(this).append('<span class="nk-count-task-region">' + text.over20 + '</span>');
              }
            }else {
              $(this).find(".nk-count-task-region").remove();
            }
          });
        }else {
          showListSubscriptions = false;
          showSubscriptions = false;
        }
      }else if (url[1] === "feeds") {
        if (url[2] === "subscriptions" && url[4].split("?")[1].split("&")[0] === "mode=events") {
          /* Это подписка */
          if (showSubscriptions) return;

          showListSubscriptions = false;
          showSubscriptions = true;

          const regionID = url[4].split("?")[0];
          const infoRegion = JSON.parse(localStorage.getItem("nk-subscriptions-" + regionID));

          setTimeout(() => {
            /* Добавим чекбокс для настройки */
            const parent = $(".nk-subscription-region-events-view__filters .nk-subscription-region-events-view__skip-self-filter");

            const addClass = infoRegion.check ? " nk-checkbox_checked" : "";

            parent.find(".nk-checkbox-subscribe").remove();
            parent.append('<label class="nk-checkbox nk-checkbox_theme_islands nk-checkbox_size_m nk-checkbox_margin-left nk-checkbox-subscribe' + addClass + '" id="nk-show-notification"><span class="nk-checkbox__box"><input type="checkbox" value="" autocomplete="off" class="nk-checkbox__control"></span><span class="nk-checkbox__text" role="presentation">' + text.checkbox + '</span></label>');

            const checkboxElement = parent.find("#nk-show-notification");

            checkboxElement.find("input").focus(() => {
              checkboxElement.addClass("nk-checkbox_focused");
            });

            checkboxElement.find("input").blur(() => {
              checkboxElement.removeClass("nk-checkbox_focused");
            });

            checkboxElement.find("input").on("input", () => {
              checkboxElement.toggleClass("nk-checkbox_checked");

              localStorage.setItem("nk-subscriptions-" + regionID, JSON.stringify({
                count: 0,
                check: !infoRegion.check,
                event: infoRegion.event
              }));
            });
          }, 100);

          localStorage.setItem("nk-subscriptions-" + regionID, JSON.stringify({
            count: 0,
            check: infoRegion.check,
            event: infoRegion.event
          }));
          checkIconCount();
        }else {
          showListSubscriptions = false;
          showSubscriptions = false;
        }
      }else {
        showListSubscriptions = false;
        showSubscriptions = false;
      }
    }, 400);
  };


  /**
   * Инициализация модуля
   */

  const creatNotification = () => {
    iconParent = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-user-feeds-control-view");

    if (showIcon) {
      iconParent.append('<div class="nk-user-tasks-control-view__notifier nk-user-tasks-control-view__notifier_visible"></div>');
    }

    checkCount();

    editAppView();
    $(".nk-app-view").on("click", editAppView);
  };

  window.appChrome.init.notificationRegion = creatNotification;
})();