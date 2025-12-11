# دليل نشر GoRent على Fly.io

## المتطلبات الأساسية

1. **تثبيت Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **تسجيل الدخول**
   ```bash
   fly auth login
   ```

## خطوات النشر

### 1️⃣ إنشاء التطبيق

```bash
# من جذر المشروع d:/go-rent
fly launch --no-deploy

# سيطلب منك:
# - اسم التطبيق (مثلاً: go-rent أو go-rent-ma)
# - المنطقة (اختر cdg للمغرب/أوروبا)
# - قاعدة بيانات PostgreSQL (اختر نعم)
```

### 2️⃣ إنشاء قاعدة بيانات PostgreSQL

```bash
# إذا لم تُنشأ تلقائياً
fly pg create --name go-rent-db --region cdg

# ربط القاعدة بالتطبيق
fly pg attach go-rent-db
```

سيضيف Fly متغير `DATABASE_URL` تلقائياً.

### 3️⃣ تعيين متغيرات البيئة

```bash
fly secrets set PORT=8080
fly secrets set NODE_ENV=production
# DATABASE_URL يُضاف تلقائياً عند ربط PostgreSQL
```

### 4️⃣ تشغيل الهجرة (إضافة الجداول)

```bash
# بعد النشر الأول، افتح console
fly ssh console

# داخل الحاوية
node src/scripts/run_missing_tables.js

# أو استخدم sequelize migrations
npx sequelize-cli db:migrate

# اخرج من console
exit
```

### 5️⃣ نشر التطبيق

```bash
fly deploy
```

سيقوم Fly بـ:
- بناء الصورة من `Dockerfile`
- رفعها إلى السحابة
- تشغيل الحاوية
- عرض رابط التطبيق (مثلاً: https://go-rent.fly.dev)

### 6️⃣ التحقق من التطبيق

```bash
# فتح التطبيق في المتصفح
fly open

# عرض السجلات
fly logs

# التحقق من حالة التطبيق
fly status
```

## إضافة بيانات أولية (اختياري)

```bash
fly ssh console

# داخل الحاوية
node backend/seedPermissions.js
# أو أي سكريبت seed آخر

exit
```

## أوامر مفيدة

| الأمر | الوصف |
|------|-------|
| `fly logs` | عرض سجلات التطبيق |
| `fly ssh console` | فتح terminal داخل الحاوية |
| `fly status` | التحقق من حالة التطبيق |
| `fly scale count 2` | زيادة عدد النسخ |
| `fly pg connect -a go-rent-db` | الاتصال بقاعدة البيانات |
| `fly apps restart go-rent` | إعادة تشغيل التطبيق |
| `fly deploy` | نشر تحديثات جديدة |

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من متغيرات البيئة
fly secrets list

# تحقق من حالة قاعدة البيانات
fly pg status -a go-rent-db
```

### خطأ 500 في Dashboard
```bash
# تحقق من السجلات
fly logs

# تأكد من تشغيل الهجرة
fly ssh console
node src/scripts/run_missing_tables.js
```

### الصور لا تُحمّل
تأكد من أن مجلد `uploads` موجود ومتاح:
```bash
fly ssh console
ls -la uploads/
```

## تحديثات مستقبلية

```bash
# بعد تعديل الكود
git add .
git commit -m "تحديث الميزة X"
fly deploy
```

## ملاحظات مهمة

- **التكلفة**: Fly.io يوفر طبقة مجانية محدودة. راقب الاستخدام.
- **النطاق المخصص**: يمكنك ربط نطاقك الخاص عبر `fly certs add yourdomain.com`
- **النسخ الاحتياطي**: قم بعمل backup دوري لقاعدة البيانات
- **الأمان**: لا تضع كلمات السر في `fly.toml`، استخدم `fly secrets set`

## الدعم

- [Fly.io Docs](https://fly.io/docs/)
- [Fly.io Community](https://community.fly.io/)
