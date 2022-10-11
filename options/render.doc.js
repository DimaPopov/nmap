'use strict';

/*
* Форматирует страницу в документацию
*/

(function () {
  const html = $('html');
  const head = html.find('head');
  const body = html.find('body');

  const manifest = chrome.runtime.getManifest();
  const link = window.location.pathname;

  const data = {
    header: {
      title: manifest.name,
      logo: "/logo.svg"
    },
    menu: [
      {
        label: "Что такое " + manifest.name,
        link: "/index.html"
      },
      {
        label: "Модули",
        link: "/options/module/index.html",
        switcher: [
          {
            label: "Любимые объекты",
            link: "/options/module/favorite-objects.html",
            module: true,
            setting_name: "favorite-objects"
          },
          {
            label: "Картографические сервисы",
            link: "/options/module/open-services.html",
            module: true,
            setting_name: "open-services"
          }
        ]
      },
      {
        label: "Системная информация",
        link: "/options/system.html"
      }
    ]
  };



  let settings = {};
  chrome.storage.local.get(["nkSetting"], (result) =>  settings = result.nkSetting);


  const renderMenyItem = (parent, itemData, submeny = false) => {
    let item;

    if (submeny) {
      parent.append('<div class="doc-c-menu__item doc-c-menu__item_type_submenu"></div>');
      item = parent.find(".doc-c-menu__item_type_submenu:last-child");
    }else {
      parent.append('<div class="doc-c-menu__item doc-c-menu__item_opener_yes"></div>');
      item = parent.find(".doc-c-menu__item_opener_yes:last-child");
    }

    if (link === itemData.link) {
      item.addClass("doc-c-menu__item_current_yes");

      if (submeny) {
        item.parent().addClass('doc-c-menu__item_open_yes');
      }
    }

    if (!!itemData.switcher) {
      item.append('<div class="doc-c-menu__switcher"></div>');

      if (link === itemData.link) {
        if (submeny) {
          item.parent().addClass('doc-c-menu__item_open_yes');
        }else {
          item.addClass('doc-c-menu__item_open_yes');
        }
      }
    }

    item.append('<a class="link link_theme_black doc-c-menu__link doc-c-i-bem link_js_inited i-bem" tabindex="0" href="' + itemData.link + '"><div class="doc-c-menu__border-left"></div>' + itemData.label + '</a>')
    const height = item.height();

    item.find('.doc-c-menu__border-left').css("height", height + "px");

    if (!!itemData.switcher && !submeny) {
      itemData.switcher.forEach((itemSubmeny) => {
        renderMenyItem(item, itemSubmeny, true);
      });
    }
  };


  /* Генерация структуры документации */

  html.attr("lang", "ru");

  head.append('<title>' + data.header.title + '</title>');

  body.addClass('doc-app');

  body.wrapInner('<div class="doc-view doc-grid"></div>');
  const documentView = body.find(".doc-view");

  documentView.before('<header class="doc-section"><div class="doc-page doc-grid"><img class="doc-logo" src="' + data.header.logo + '" alt="" draggable="false"><h1 class="doc-title-header">' + data.header.title + '</h1><p class="version">v' + manifest.version + '</p></div></header>');
  documentView.wrapInner('<div class="document-content doc-c"></div>');
  const documentContent = documentView.find(".document-content");

  documentContent.before('<div class="document-menu"><div class="document-menu__inner"><div class="doc-c-menu doc-c doc-c-i-bem doc-c-menu_js_inited"><div class="doc-c-menu__content doc-c-menu__content_opener_yes doc-c-menu__content_open_yes doc-c-menu__content_has-current_yes"></div></div></div></div>');
  const documentMenu = documentView.find(".document-menu .doc-c-menu .doc-c-menu__content");

  setTimeout(() => {
    data.menu.forEach((item) => {
      renderMenyItem(documentMenu, item);
    });

    const switcherMenu = documentMenu.find(".doc-c-menu__switcher");
    switcherMenu.on("click", () => {
      switcherMenu.parent().toggleClass("doc-c-menu__item_open_yes");
    });

    const imageNeedAlt = documentContent.find("img:not([alt])");
    imageNeedAlt.attr("alt", "");

    const imageNeedDdraggable = documentContent.find("img:not([draggable])");
    imageNeedDdraggable.attr("draggable", "false");

    const linkNeedClass = documentContent.find("a:not([class='doc-c-lidoc'])");
    linkNeedClass.addClass("doc-c-lidoc");

    const linkNeedPreload = documentMenu.find("a:not([rel='prerender'])");
    linkNeedPreload.attr("rel", "prerender");
  }, 10);
})();