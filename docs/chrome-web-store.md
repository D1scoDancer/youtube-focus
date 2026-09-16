# Публикация в Chrome Web Store

Шпаргалка на случай повторной подачи: готовые тексты для карточки, обоснования
разрешений и порядок действий.

## Сборка пакета

```bash
./scripts/package.sh
```

Скрипт кладёт `dist/youtube-focus-<версия>.zip` с `manifest.json` в корне архива
— именно такой формат ждёт магазин. Перед каждой новой загрузкой нужно поднять
`version` в `manifest.json`: залить дважды один и тот же номер магазин не даст.

## Порядок действий

1. Зарегистрировать аккаунт разработчика на
   https://chrome.google.com/webstore/devconsole — разовый взнос $5.
2. «New item» → загрузить zip.
3. Заполнить карточку (тексты ниже) и вкладку «Privacy practices» (обоснования
   ниже).
4. Приложить скриншоты: от 1 до 5 штук, 1280×800 или 640×400, PNG или JPEG.
5. Отправить на проверку. Обычно занимает от нескольких часов до нескольких
   дней; расширения, которые меняют поведение чужого сайта, проверяют дольше.

## Языки

Интерфейс расширения переведён на 14 языков (`_locales/`): en, ru, uk, es, pt_BR,
fr, de, it, pl, tr, ja, ko, zh_CN, hi. Язык по умолчанию — английский, его
магазин и показывает всем, для кого нет перевода карточки.

Название и краткое описание магазин берёт прямо из `_locales/<язык>/messages.json`
(ключи `extName` и `extDescription`), поэтому карточка переводится сама. Подробное
описание переводится вручную во вкладке локализации консоли разработчика.

Арабского и иврита в наборе нет намеренно: страницы расширения свёрстаны слева
направо, и без отдельной поддержки RTL перевод выглядел бы сломанным.

## Тексты карточки

Основной язык карточки — английский.

**Краткое описание** (до 132 символов):

> Removes Shorts and turns the YouTube home page from an endless feed into a
> showcase you cannot play videos from.

**Подробное описание:**

> Youtube Focus removes the two biggest attention traps from YouTube: the
> endless recommendation feed and Shorts.
>
> HOME PAGE — pick one of two modes.
>
> • Showcase without playback. The feed stays visible, but nothing opens from
> it: not a click, not a middle click, not «Open in a new tab». The native Watch
> later button on the thumbnail keeps working — that is how you collect what you
> will watch deliberately.
> • Go straight to what you planned. The home page is replaced by your Watch
> later playlist, or any other address you choose.
>
> SHORTS are cut out of the feed, search, subscriptions, the sidebar, the left
> menu and channel tabs. Opening a short video is intercepted and shows a stub —
> both from a direct link and while navigating inside YouTube.
>
> VIDEO PAGE — optionally hides the recommendation column on the right along
> with the end screens on top of the player, and the comments section. The
> player itself stays exactly where it was.
>
> The planned list is YouTube's own Watch later playlist. The extension stores
> nothing of its own, so your list stays yours and remains available on your
> phone and TV.
>
> No analytics, no network requests, no data collection. The source code is
> open: https://github.com/D1scoDancer/youtube-focus

## Тексты карточки на русском

**Краткое описание** (до 132 символов):

> Убирает Shorts и превращает главную страницу YouTube из бесконечной ленты в
> витрину без запуска видео.

**Подробное описание:**

> Youtube Focus убирает из YouTube две главные ловушки внимания: бесконечную
> ленту рекомендаций и Shorts.
>
> ГЛАВНАЯ СТРАНИЦА — на выбор один из двух режимов.
>
> • Витрина без запуска. Лента видна, но открыть из неё видео нельзя ничем: ни
> кликом, ни средним кликом, ни через «Открыть в новой вкладке». При этом
> штатная кнопка YouTube «Смотреть позже» на превью работает — ею и пополняется
> список того, что вы посмотрите осознанно.
> • Сразу уходить к запланированному. Главная заменяется плейлистом «Смотреть
> позже» или любым другим адресом на ваш выбор.
>
> SHORTS вырезаются из ленты, поиска, подписок, бокового столбца, левого меню и
> вкладок канала. Переход на короткое видео перехватывается и показывает
> заглушку — и по прямой ссылке, и при переходе внутри YouTube.
>
> СТРАНИЦА ВИДЕО — по желанию скрывает столбец рекомендаций справа вместе с
> конечными заставками поверх плеера, а также блок комментариев. Плеер при этом
> остаётся ровно на своём месте.
>
> Список запланированного — это родной плейлист YouTube «Смотреть позже».
> Расширение ничего не хранит у себя: список остаётся вашим и доступен с
> телефона и телевизора.
>
> Никакой аналитики, никаких сетевых запросов, никакого сбора данных. Исходный
> код открыт: https://github.com/D1scoDancer/youtube-focus

**Категория:** Productivity (Продуктивность).

## Вкладка Privacy practices

**Единственное назначение (single purpose):**

> Расширение убирает со страниц YouTube элементы, провоцирующие бесконтрольный
> просмотр: ленту рекомендаций на главной и короткие видео Shorts.

**Обоснования разрешений:**

- `storage` — хранит настройки пользователя (режим главной страницы, адрес
  плана, режим Shorts, тумблеры скрытия блоков). Ничего, кроме настроек.
- `declarativeNetRequest` — одно статическое декларативное правило,
  перенаправляющее переход на youtube.com/shorts/ на страницу-заглушку
  расширения. Трафик не читается и не логируется.
- `alarms` — один таймер, возвращающий блокировки после временной паузы,
  включённой пользователем.
- Доступ к `*://*.youtube.com/*` — расширение работает только на YouTube:
  скрывает Shorts и блокирует запуск видео из ленты. Других сайтов не касается.

**Сбор данных:** не собирается ничего ни по одной из категорий формы.

**Политика конфиденциальности:**
https://github.com/D1scoDancer/youtube-focus/blob/main/PRIVACY.md

## Скриншоты

Снимать нужно рабочие экраны расширения. Что показать:

1. Главная в режиме витрины с всплывшей подсказкой после клика по видео.
2. Страница настроек.
3. Заглушка при переходе на Shorts.
4. Страница видео со скрытыми рекомендациями и комментариями.

Перед съёмкой стоит убедиться, что в кадр не попали личные данные: имя аккаунта,
аватар, содержимое ваших подписок и истории просмотров.

## Что учесть при проверке

Магазин придирчив к названиям, использующим чужие торговые марки. Если подача
вернётся с претензией к слову «Youtube» в названии, достаточно поменять поле
`name` в `manifest.json` — на работу расширения это не влияет.
