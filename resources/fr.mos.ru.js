'use strict';

/**
 * Ищет дома, участвующие в программе реновации
 */

(function () {
  const render = (parent, addres, restartCount = 0) => {
    const popupShow = window.appChrome.popupShow;

    const addrFrMosRu = $("#fr_mos_ru");
    if (addrFrMosRu[0]) return;

    if (window.fr_mos_ru?.address) {
      let frMosRuID = window.fr_mos_ru.address.indexOf(addres);
      let infoFrMosRu = null;
      let frMosRuStreet = null;

      if (frMosRuID !== -1) {
        if (window.fr_mos_ru.address[frMosRuID] !== addres) frMosRuID === -1;
      }

      if (frMosRuID !== -1) {
        infoFrMosRu = window.fr_mos_ru.items[frMosRuID];
      }else {
        frMosRuStreet = window.fr_mos_ru.street?.[addres.split(",")[0].toLowerCase()];

        if (frMosRuStreet) {
          frMosRuStreet.address.forEach((item, i) => {
            if (item.toLowerCase().indexOf(addres.toLowerCase()) !== -1) {
              if (
                item.toLowerCase() === addres.toLowerCase() ||
                item.indexOf(`(${addres})`) !== -1 ||
                item.split(" (")[0] === addres
              ) {
                frMosRuID = i;
                infoFrMosRu = frMosRuStreet.items[i];
              }
            }else if (
              item.replace(" вл", " ").split(", уч.")[0] === addres ||
              item.split(", уч.")[0] === addres.replace(" вл", " ")
            ) {
              frMosRuID = i;
              infoFrMosRu = frMosRuStreet.items[i];
            }
          });
        }
      }

      if (infoFrMosRu) {
        const info = window.appChrome.getStatusCategory(infoFrMosRu);

        parent.prepend(`<div id="fr_mos_ru" class="nk-section nk-section_level_2"><div class="fr_mos_ru-logo"></div><div class="fr-mos-ru-box fr-mos-ru-box-${info.color}">${info.cat_name}</div><div class="fr_mos_ru-status_text">${info.status_text}</div><div class="fr_mos_ru-center">${info.info_center}</div>${infoFrMosRu?.code ? `<a role="link" class="fr_mos_ru-name_orign" href="https://fr.mos.ru/uchastnikam-programmy/karta-renovatsii/${infoFrMosRu.code}/" target="_blank" rel="noopener noreferrer">${infoFrMosRu.name_orign}</a>` : `<div class="fr_mos_ru-name_orign">${infoFrMosRu.name_orign}</div>`}</div>`);
      }else if (frMosRuStreet) {
        parent.prepend(`<div id="fr_mos_ru" class="nk-section nk-section_level_2"><div class="fr_mos_ru-logo"></div><div class="fr_mos_ru-status_text">Не участвует в программе реновации</div><div class="fr_mos_ru-center">Этот дом не участвует в программе реновации.</div><div class="fr_mos_ru-name_orign-list fr_mos_ru-name_orign-popout"><span>Дома с этой улицы, участвующие в программе</span></div></div>`);

        const text = $("#fr_mos_ru .fr_mos_ru-name_orign-list");
        const textPopout = $("#fr_mos_ru .fr_mos_ru-name_orign-popout");

        const countAfter5 = frMosRuStreet.items.length - 5;
        const textCountAfter5 = countAfter5 === 1 ? "домов" : countAfter5 < 5 ? "дома" : "домов";

        const frMosRuPopup = [...frMosRuStreet.items].splice(0, 5);

        popupShow(textPopout, frMosRuPopup.map((item) => {
          const info = window.appChrome.getStatusCategory(item);
          return `— ${item.name}\n     ${info.status_text.replace("\n", ' ')}`;
        }).join("\n\n") + (countAfter5 > 0 ? `\n\nЕщё ${countAfter5} ${textCountAfter5}` : ''));

        const showText = () => {
          text.after(`<div class="fr_mos_ru-name_orign-list-show">${frMosRuStreet.items.map((item) => {
            const info = window.appChrome.getStatusCategory(item);
            
            return item?.code ? 
              `<a href="https://fr.mos.ru/uchastnikam-programmy/karta-renovatsii/${item.code}/" target="_blank" rel="noopener noreferrer">— ${item.name}\n     <span>${info.status_text.replace("\n", ' ')}</span></a>` :
              `— ${item.name}\n     <span>${info.status_text.replace("\n", ' ')}</span>`;
          }).join("\n\n")}</div>`);

          const popup = $(".nk-portal-local .nk-popup");
          popup.removeClass("nk-popup_visible");

          text.remove();
        };

        text.on("click", showText);
      }
    }else {
      if (restartCount === 5) {
        window.appChrome.notification("error", "Не удалось получить информацию от Фонда реновации");
      }else {
        setTimeout(() => {
          render(parent, addres, restartCount + 1);
        }, 1000);
      }
    }
  }

  window.fr_mos_ru_render = render;
})();