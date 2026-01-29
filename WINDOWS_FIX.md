# PixelCraft - حل مشاكل Windows

## المشكلة: NODE_ENV غير معروف على Windows

عند محاولة تشغيل `pnpm dev` على Windows، قد تحصل على الخطأ:
```
'NODE_ENV' is not recognized as an internal or external command
```

## الحل: تثبيت cross-env

تم تحديث `package.json` ليستخدم `cross-env` الذي يدعم Windows و Linux و Mac.

### الخطوات:

#### 1. تثبيت المكتبات مجدداً
```bash
pnpm install
```

#### 2. بدء خادم التطوير
```bash
pnpm dev
```

### إذا استمرت المشكلة:

#### الخيار 1: استخدام PowerShell بدلاً من CMD
```powershell
# في PowerShell
$env:NODE_ENV="development"
pnpm dev
```

#### الخيار 2: استخدام WSL (Windows Subsystem for Linux)
```bash
# في WSL
pnpm dev
```

#### الخيار 3: استخدام Docker
```bash
docker-compose up
```

### التحقق من الإصلاح:

بعد تشغيل `pnpm install`، يجب أن تشاهد:
```
added 1 package
```

ثم عند تشغيل `pnpm dev`، يجب أن تشاهد:
```
Server running on http://localhost:3000/
```

### الملفات المحدثة:

- ✅ `package.json` - تم إضافة `cross-env` إلى devDependencies
- ✅ السكريبتات محدثة لاستخدام `cross-env`

### الأوامر الجديدة:

```bash
# بدء خادم التطوير (يعمل على Windows/Mac/Linux)
pnpm dev

# بناء المشروع
pnpm build

# بدء خادم الإنتاج
pnpm start

# تشغيل الاختبارات
pnpm test

# التحقق من الأخطاء
pnpm check
```

## ملاحظات إضافية:

1. **تأكد من استخدام pnpm**: هذا المشروع يستخدم pnpm وليس npm
2. **تحديث pnpm**: إذا كنت تستخدم إصدار قديم من pnpm، قم بتحديثه:
   ```bash
   npm install -g pnpm@latest
   ```

3. **مشاكل الموانع (Firewall)**: إذا كان لديك مشاكل في الاتصال، تأكد من أن المنفذ 3000 غير محجوب

## الدعم:

إذا استمرت المشاكل:
1. احذف مجلد `node_modules` و `pnpm-lock.yaml`
2. قم بتشغيل `pnpm install` مجدداً
3. جرب `pnpm dev` مرة أخرى
