FROM node:20-alpine

# إنشاء مجلّد العمل وتهيئة الصلاحيات
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# نسخ ملفات الباكيج أولاً لتسريع الـ cache
COPY package*.json ./

# الإنتقال لمستخدم node (أمان)
USER node

# تثبيت الاعتمادات
RUN npm i

# نسخ باقي السورس بملكيّة المستخدم node
COPY --chown=node:node . .

# المنفذ
EXPOSE 3000

# تشغيل التطبيق عبر npm start (اللي هو "node server.js")
CMD ["npm", "start"]
