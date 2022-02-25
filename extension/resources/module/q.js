'use strict';

/**
* Добавляет возможность перехода из Q в профиль в Народной карте
*
* ❗ Модуль не поддерживается разработчиком расширения
*/

(function () {
  let setting = {};

  chrome.storage.local.get(["nkSetting"], (result) => {
    if (!result.nkSetting) {
      const default_setting = {
        'get-user': true,
        'get-profile': true,
        'check-address': true,
        'q-link': false
      };

      chrome.storage.local.set({ "nkSetting": default_setting });
      setting = default_setting;
    }else {
      setting = result.nkSetting;
    }

    if (setting["q-link"]) {
      const nks = '<span class="_2nk-link" style="color:#005ac2de;padding-left:5px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 22" fill-rule="evenodd" fill="currentColor"><path d="m11 13.05c2.0986 0 3.8-1.7013 3.8-3.8 0-2.09869-1.7014-3.8-3.8-3.8-2.09873 0-3.80005 1.70131-3.80005 3.8 0 2.0987 1.70132 3.8 3.80005 3.8zm0-2c.9941 0 1.8-.8059 1.8-1.8 0-.99412-.8059-1.8-1.8-1.8-.9942 0-1.80005.80588-1.80005 1.8 0 .9941.80585 1.8 1.80005 1.8z"></path><path d="m16.2649 16.8551c.428-.3688.8941-.7705 1.2722-1.1462 1.6726-1.6615 2.7129-3.9653 2.7129-6.5089 0-5.09416-4.1543-9.2-9.25-9.2-5.09567 0-9.25 4.10584-9.25 9.2 0 2.5436 1.04033 4.8474 2.71293 6.5089.37804.3757.8442.7774 1.27214 1.1462l.03715.032c.46151.3978.91164.7864 1.33069 1.1872.91995.8798 1.32391 1.489 1.40542 1.8391.14242.6119.77226 2.0866 2.49167 2.0866 1.7194 0 2.3492-1.4747 2.4917-2.0866.0815-.3501.4854-.9593 1.4054-1.8391.419-.4008.8692-.7894 1.3307-1.1872zm-9.19058-1.4861c.97098.8369 2.09554 1.8062 2.78861 2.8246.0435.0639.0853.128.12525.1923.16482.2651.29822.5332.39012.8028.0307.0903.0569.1807.078.2713.0675.2903.2436.54.5437.54s.4762-.2497.5438-.54c.021-.0906.0472-.181.0779-.2713.0919-.2696.2253-.5377.3901-.8028.04-.0643.0818-.1284.1253-.1923.693-1.0184 1.8176-1.9877 2.7886-2.8246.4542-.3914.8748-.7539 1.2019-1.079 1.3115-1.3028 2.1224-3.1024 2.1224-5.09 0-3.97656-3.2458-7.2-7.25-7.2-4.00418 0-7.25 3.22344-7.25 7.2 0 1.9876.81091 3.7872 2.12244 5.09.32709.3251.74769.6876 1.20188 1.079z"></path></svg><span></span></span>';

      let na=0, np, nn=0;

      function nki(){
        let a = document.querySelectorAll("a[href*='profile']");

        if(a.length < 14 && ++nn < 6) setTimeout(nki,800);
        if(na === a.length) return;

        nn = 0
        na = a.length;

        a.forEach((e) => {
          let pe=e.parentElement;
          let epe=0;

          if(pe.querySelector('._2nk-link')) return;

          epe = pe.querySelector('._180RolQxos');

          if(epe){
            const l = e.href.replace(/yandex.ru\/q\/profile/,'n.maps.yandex.ru/#!/users');
            epe.insertAdjacentHTML('afterend','<a href="'+l+'" target="_blank" style="z-index: 21">'+nks+'</a>')
          }
        });

        let epe = document.querySelector('.TtZDiGx6BU._180RolQxos');

        if(epe && ((np = document.location.href.match(/.*\/(\S+)\/$/)[1]) !== np)) {
          epe.classList.remove('_2nk-link');
          a=epe.parentElement.querySelector('a');
          a&&a.remove();
        }

        let l;
        if (epe && !(epe.className.indexOf('_2nk') + 1)) {
          epe.className += " _2nk-link";
          l = document.location.href.replace(/yandex.ru\/q\/profile/, 'n.maps.yandex.ru/#!/users');

          epe.insertAdjacentHTML('afterend', '<a href="' + l + '" target="_blank" style="z-index: 21">' + nks.replace(/"16"/g, '24').replace(/padding-left:5px;/, '') + '</a>');

          na = 0;
          setTimeout(nki, 600);
        }}

      document.onwheel= nki;
      document.onclick= ()=> {
        na=0;
        setTimeout(nki,600)
      };

      nki();
    }
  });
})();