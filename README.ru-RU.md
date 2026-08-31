# 🎨 Lobe Theme Neo

<div align="center">

**Современный Glassmorphism-интерфейс, оптимизированный для Stable Diffusion WebUI & Forge Neo (Gradio 4)**

[![Релиз](https://img.shields.io/github/v/release/LeonWGal/lobe-theme-neo?color=7952F5&style=flat-square)](https://github.com/LeonWGal/lobe-theme-neo/releases)
[![Оригинал LobeHub](https://img.shields.io/badge/Upstream-lobehub%2Fsd--webui--lobe--theme-18181b?style=flat-square&logo=github)](https://github.com/lobehub/sd-webui-lobe-theme)
[![Совместимость с Forge Neo](https://img.shields.io/badge/Forge_Neo-Gradio_4.x-00C7B7?style=flat-square)](https://github.com/Haoming02/sd-webui-forge-classic)
[![Лицензия](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](./LICENSE)
[![Поддержка языков](https://img.shields.io/badge/i18n-11_Languages-success?style=flat-square)](#-интернационализация)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/LeonWGal/lobe-theme-neo/pulls)

[English](./README.md) · [Русский](./README.ru-RU.md) · [简体中文](./README.zh-CN.md)

</div>

---

## ✨ Ключевые возможности

* 🌗 **Мгновенное переключение Dark / Light темы**: Смена темы без перезагрузки страницы через динамические CSS-классы и синхронизацию состояния URL (`history.replaceState`), исключая зависания Gradio.
* 🧩 **Полная адаптация под Forge Neo & Gradio 4**: Собственные селекторы и безопасная работа с Shadow DOM структурой Gradio 4.
* 📐 **SplitView (Двухколоночный режим)**: Удобное разделение параметров генерации и галереи предпросмотра с автоматическим позиционированием кнопки очереди `agent-scheduler-neo` (Enqueue).
* 🎴 **Extra Networks Sidebar 2.0**: Выдвижная панель LoRA, Checkpoints и Embeddings с плавной регулировкой масштаба карточек, поиском и интеграцией кнопок Civitai Helper.
* 🪄 **Prompt Studio & Formator**: Быстрое автоформатирование промптов, регулировка весов тегов, подсветка синтаксиса и очистка лишних знаков.
* 🛡️ **Поддержка сторонних расширений**: Готовые визуальные хуки и стили для ADetailer Neo, TIPO, Booru Tags Gacha, Dynamic Prompts, Aspect Ratio Plus и TagComplete.
* 🌐 **Многоязычность (i18n)**: Встроенная локализация на 11 языков (Русский, English, 简体中文, 繁體中文, 日本語, 한국어, Deutsch, Español, Français, Português, Turkish).

---

## 🏛 Архитектура и интеграция

`lobe-theme-neo` разворачивает интерфейсный слой на React 18 / Ant Design поверх ядра Forge Neo / Gradio 4:

```
┌───────────────────────────────────────────────────────────┐
│                     Lobe Theme Neo                        │
├─────────────────────────────┬─────────────────────────────┤
│  Top Header (Навигация/Меню)│  QuickSettings Сайдбар      │
├─────────────────────────────┼─────────────────────────────┤
│  SplitView Рабочая область  │  Extra Networks Сайдбар     │
│  - Параметры генерации (L)  │  - LoRA / Embeddings (R)    │
│  - Галерея превью (R)       │  - Civitai Метаданные       │
└─────────────────────────────┴─────────────────────────────┘
                              │ (Controlled DOM Injections)
                              ▼
┌───────────────────────────────────────────────────────────┐
│              Forge Neo / Gradio 4 Core Engine             │
└───────────────────────────────────────────────────────────┘
```

* **Безопасные DOM-порталы (`useInject`)**: Узлы Gradio не разрушаются, а аккуратно оборачиваются и перемещаются, сохраняя все нативные обработчики событий и состояние компонентов.
* **Реактивные Mutation Observers**: Автоматическое отслеживание асинхронной загрузки вкладок, текстовых полей и панелей расширений.
* **Двойная синхронизация настроек**: Параметры интерфейса сохраняются в `localStorage` браузера (`SD-LOBE-SETTING`) и дублируются на сервере в `lobe_theme_config.json` через Fast-API эндпоинты `/lobe/config`.

---

## 📊 Матрица совместимости

| Среда / Расширение | Статус | Примечание |
| :--- | :---: | :--- |
| **Forge Neo (Gradio 4.x)** | 🟢 Полная | Нативная поддержка `#quicksettings`, dtype-бейджей и настроек памяти |
| **SD WebUI (A1111 1.9+)** | 🟢 Полная | Обратная совместимость через fallback-селекторы |
| **ADetailer Neo** | 🟢 Полная | Адаптивная верстка аккордеонов и контейнеров |
| **Agent Scheduler Neo** | 🟢 Полная | Автоматический перенос кнопки Enqueue в SplitView |
| **TagComplete (a1111-tac)** | 🟢 Полная | Корректный z-index приоритет поверх `PromptHighlight` |
| **Civitai Helper** | 🟢 Полная | Авто-инъекция ссылок, триггер-слов и промптов превью |

---

## 🚀 Установка и быстрый старт

### Способ 1: Через веб-интерфейс WebUI / Forge (Рекомендуется)
1. Откройте интерфейс Forge Neo / WebUI.
2. Перейдите во вкладку **Extensions** ➔ **Install from URL**.
3. Вставьте URL репозитория:
   ```text
   https://github.com/LeonWGal/lobe-theme-neo.git
   ```
4. Нажмите **Install**.
5. Перейдите во вкладку **Installed**, нажмите **Apply and restart UI**.

### Способ 2: Через Git
```bash
cd extensions
git clone https://github.com/LeonWGal/lobe-theme-neo.git
```

### Обновление
```bash
cd extensions/lobe-theme-neo
git pull origin main
```

> [!IMPORTANT]
> Во избежание визуальных конфликтов отключите другие версии Lobe Theme или Kitchen Theme перед включением `lobe-theme-neo`.

---

## ⚙️ Настройки и персонализация

Открыть панель настроек можно кликом по иконке ⚙️ в верхней панели:

| Раздел | Опции |
| :--- | :--- |
| **🎨 Внешний вид** | 14 акцентных цветов, нейтральные оттенки, кастомный логотип и заголовок, веб-шрифты, режим уменьшения анимаций. |
| **📐 Раскладка и SplitView**| Двухколоночный режим галереи, отступы, отображение/скрытие футера. |
| **⬅️ Панель QuickSettings** | Фиксированный (Fixed) или плавающий (Float) режим, состояние раскрытия, ширина по умолчанию. |
| **➡️ Панель Extra Networks** | Фиксированный / плавающий режим, размер сетки карточек (64px - 256px), выбор вкладки по умолчанию. |
| **🪄 Текстовые поля промптов** | Режим прокрутки или ресайза, подсветка синтаксиса, встроенный редактор Prompt Editor с тегами. |

---

## 🛠️ Разработка и сборка

Проект построен на Vite, React 18 и TypeScript:

```bash
# 1. Установка зависимостей
npm install

# 2. Проверка типов
npm run type-check

# 3. Сборка продакшн-бандла (компилируется в javascript/main.mjs)
npm run build
```

---

## 💖 Благодарности и оригинальный проект

`lobe-theme-neo` является модернизированным развитием и адаптацией под Forge Neo оригинальной темы **[sd-webui-lobe-theme](https://github.com/lobehub/sd-webui-lobe-theme)**.

* **Создатели и авторы оригинала**: Команда **[LobeHub](https://github.com/lobehub)** и **[CanisMinor](https://github.com/canisminor1990)** (`i@lobehub.com`).
* **Оригинальный репозиторий**: [lobehub/sd-webui-lobe-theme](https://github.com/lobehub/sd-webui-lobe-theme) — Выражаем огромную благодарность LobeHub за инновационный UI/UX дизайн, библиотеку компонентов `@lobehub/ui` и колоссальный вклад в экосистему Stable Diffusion.
* **Адаптация и развитие для Forge Neo**: Поддерживается [LeonWGal](https://github.com/LeonWGal) (поддержка Gradio 4, SplitView, исправление runtime-ошибок и интеграция с новыми расширениями).

---

## 📄 Лицензия

Распространяется под лицензией [AGPL-3.0 License](./LICENSE) в соответствии с лицензией оригинального проекта LobeHub.
