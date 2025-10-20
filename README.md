# HarthHDR - نظام الدعم الفني والشكاوى

موقع احترافي لاستقبال الشكاوى ومراسلة الدعم الفني مع لوحة تحكم شاملة.

## المميزات

### الصفحة الرئيسية
- نموذج إرسال شكاوى واستفسارات سهل الاستخدام
- تصميم عصري بألوان بنفسجية ووردية جذابة
- متجاوب بالكامل مع جميع الأجهزة (هواتف، تابلت، حواسيب)
- معلومات التواصل (هاتف، بريد إلكتروني، واتساب)

### لوحة التحكم
- **إدارة الشكاوى**: عرض، تصفية، تحديث الحالة والأولوية
- **إدارة الصفحات**: إنشاء وتعديل صفحات مخصصة للموقع
- **الإعدادات**: ربط واتساب API لإرسال إشعارات تلقائية
- **إحصائيات مباشرة**: لحالة الشكاوى والأداء

### إشعارات واتساب
- إرسال إشعار تلقائي على واتساب عند استلام شكوى جديدة
- دعم API من wasenderapi.com
- إعداد سهل من صفحة الإعدادات

## التقنيات المستخدمة

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express + tRPC 11
- **Database**: MySQL/TiDB + Drizzle ORM
- **UI Components**: shadcn/ui
- **Authentication**: JWT-based authentication

## التثبيت والتشغيل

### المتطلبات
- Node.js 22+
- pnpm
- MySQL/TiDB database

### خطوات التثبيت

1. استنساخ المشروع:
```bash
git clone https://github.com/harthhdr/harthhdr-support.git
cd harthhdr-support
```

2. تثبيت المكتبات:
```bash
pnpm install
```

3. إعداد متغيرات البيئة:
```bash
cp .env.example .env
```

ثم قم بتعديل ملف `.env` وإضافة:
- `DATABASE_URL`: رابط قاعدة البيانات
- متغيرات أخرى حسب الحاجة

4. تطبيق تغييرات قاعدة البيانات:
```bash
pnpm db:push
```

5. تشغيل المشروع:
```bash
pnpm dev
```

الموقع سيعمل على: `http://localhost:3000`

## بيانات تسجيل الدخول

**لوحة التحكم:**
- اليوزر: `Harth`
- الباسورد: `Harth12`

## إعداد إشعارات واتساب

1. سجل حساب على [wasenderapi.com](https://wasenderapi.com)
2. احصل على API Key
3. من لوحة التحكم → الإعدادات:
   - أدخل API Key
   - أدخل API URL (افتراضياً: https://api.wasenderapi.com)
   - أدخل رقم الواتساب
   - فعّل الإشعارات

## النشر

### Vercel
```bash
pnpm build
vercel deploy
```

### Netlify
```bash
pnpm build
netlify deploy
```

## الترخيص

جميع الحقوق محفوظة © 2025 HarthHDR

## الدعم

للدعم والاستفسارات:
- البريد الإلكتروني: support@harthhdr.com
- الهاتف: 07xxxxxxxxx
- واتساب: 07xxxxxxxxx

