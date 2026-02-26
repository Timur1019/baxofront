# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Деплой на Render (Static Site)

1. Создайте **Static Site** в [Render](https://render.com).
2. Подключите репозиторий и укажите:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
3. В разделе **Environment** добавьте переменную:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://baxolashbek.onrender.com`
4. Сохраните и дождитесь сборки. Фронтенд будет обращаться к бэкенду по указанному URL.

После сборки приложение полностью статическое (только файлы из `dist`), Node.js на Render для его работы не требуется.
