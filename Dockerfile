FROM node:20-alpine
# إنشاء مجلّد العمل وتهيئة الصلاحيات (مثل آيات)
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
# نسخ ملفات الباكيج أولاً لتسريع الـ cache
COPY package*.json ./
# الإنتقال لمستخدم node (أمان)
USER node
RUN npm i
COPY --chown=node:node . 

EXPOSE 3000
# شغّل التطبيق عبر npm start (بدل ما نثبت اسم ملف)
CMD ["npm", "start"]
