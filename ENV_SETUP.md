# PixelCraft - Environment Variables Setup Guide

## Overview

PixelCraft يتطلب عدة متغيرات بيئة للعمل بشكل صحيح. هذا الدليل يساعدك في إعدادها.

## Quick Start (Local Development)

للتطوير المحلي، تم إنشاء ملف `.env.local` بقيم وهمية آمنة:

```bash
# الملف موجود بالفعل:
.env.local
```

هذا الملف يحتوي على قيم افتراضية آمنة للتطوير المحلي.

## Files

- `.env.example` - قالب يوضح جميع المتغيرات المطلوبة
- `.env.local` - ملف التطوير المحلي (جاهز للاستخدام)
- `.env.production` - للإنتاج (يجب إنشاؤه يدويًا)

## Environment Variables

### OAuth Configuration

```env
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
```

**الحصول على هذه المفاتيح:**
1. اذهب إلى [Manus Dashboard](https://dashboard.manus.im)
2. أنشئ تطبيق جديد
3. انسخ `App ID` و `OAuth Server URL`

### Database Configuration

```env
DATABASE_URL=mysql://user:password@localhost:3306/pixelcraft
```

**للتطوير المحلي:**
```env
DATABASE_URL=file:./dev.db
```

### JWT Secret

```env
JWT_SECRET=your_secret_key_min_32_characters
```

**إنشاء مفتاح آمن:**
```bash
# على Linux/Mac:
openssl rand -base64 32

# على Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed 0 -Count 32 | ForEach-Object {[char]$_}) -join ''))
```

### Stripe Configuration (Payment)

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**الحصول على مفاتيح Stripe:**
1. اذهب إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. اختر "Developers" → "API Keys"
3. استخدم مفاتيح الاختبار (Test Keys)
4. للـ Webhook Secret، اذهب إلى "Developers" → "Webhooks"

**للاختبار:**
- استخدم رقم البطاقة: `4242 4242 4242 4242`
- أي تاريخ انتهاء صلاحية مستقبلي
- أي رمز CVC

### Forge API (Manus Built-in APIs)

```env
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
```

**الحصول على هذه المفاتيح:**
1. اذهب إلى [Manus Dashboard](https://dashboard.manus.im)
2. اختر "API Keys"
3. أنشئ مفتاح جديد
4. انسخ المفتاح

### Owner Information

```env
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id
```

**الحصول على هذه المعلومات:**
1. اذهب إلى حسابك في [Manus](https://manus.im)
2. اختر "Account Settings"
3. انسخ معرف المستخدم (User ID/Open ID)

### Analytics (Optional)

```env
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### App Configuration

```env
VITE_APP_TITLE=PixelCraft
VITE_APP_LOGO=https://example.com/logo.png
```

## Setup Steps

### Step 1: Copy the Example File

```bash
cp .env.example .env.local
```

### Step 2: Fill in Your Values

Edit `.env.local` and replace the placeholder values with your actual credentials.

### Step 3: Verify the Setup

```bash
# Check if all required variables are set
pnpm check
```

### Step 4: Start Development

```bash
pnpm dev
```

## Development vs Production

### Development (.env.local)

- Use test/sandbox credentials
- Can use SQLite for database
- Stripe test mode
- OAuth development app

### Production (.env.production)

- Use live credentials
- Use production database (MySQL/PostgreSQL)
- Stripe live mode
- OAuth production app
- Strong JWT secret
- Secure API keys

## Security Best Practices

1. **Never commit .env files to git**
   ```bash
   # .gitignore should contain:
   .env
   .env.local
   .env.*.local
   ```

2. **Use strong secrets**
   - JWT_SECRET should be at least 32 characters
   - Use random, unique values for each environment

3. **Rotate keys regularly**
   - Change API keys periodically
   - Update Stripe keys if compromised

4. **Use environment-specific values**
   - Never use production keys in development
   - Never use development keys in production

5. **Secure your .env files**
   - Use file permissions to restrict access
   - Don't share .env files via email or chat

## Troubleshooting

### Error: OAUTH_SERVER_URL is not configured

**Solution:** Make sure `.env.local` is in the project root and contains:
```env
OAUTH_SERVER_URL=https://api.manus.im
```

### Error: Neither apiKey nor config.authenticator provided

**Solution:** Make sure Stripe keys are set:
```env
STRIPE_SECRET_KEY=sk_test_...
```

### Error: DATABASE_URL is not set

**Solution:** Add database URL to `.env.local`:
```env
DATABASE_URL=file:./dev.db
```

### Port 3000 already in use

**Solution:** Use a different port:
```bash
PORT=3001 pnpm dev
```

## Environment Variables Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| OAUTH_SERVER_URL | String | Yes | https://api.manus.im |
| VITE_OAUTH_PORTAL_URL | String | Yes | https://portal.manus.im |
| VITE_APP_ID | String | Yes | app_id_123 |
| DATABASE_URL | String | Yes | file:./dev.db |
| JWT_SECRET | String | Yes | secret_key_32_chars |
| STRIPE_SECRET_KEY | String | No | sk_test_... |
| VITE_STRIPE_PUBLISHABLE_KEY | String | No | pk_test_... |
| STRIPE_WEBHOOK_SECRET | String | No | whsec_... |
| BUILT_IN_FORGE_API_URL | String | No | https://api.manus.im |
| BUILT_IN_FORGE_API_KEY | String | No | api_key_123 |
| VITE_FRONTEND_FORGE_API_URL | String | No | https://api.manus.im |
| VITE_FRONTEND_FORGE_API_KEY | String | No | frontend_key_123 |
| OWNER_NAME | String | No | Your Name |
| OWNER_OPEN_ID | String | No | user_id_123 |
| VITE_ANALYTICS_ENDPOINT | String | No | https://analytics.manus.im |
| VITE_ANALYTICS_WEBSITE_ID | String | No | website_id_123 |
| VITE_APP_TITLE | String | No | PixelCraft |
| VITE_APP_LOGO | String | No | https://example.com/logo.png |
| NODE_ENV | String | No | development |

## Support

For more information:
- [Manus Documentation](https://docs.manus.im)
- [Stripe Documentation](https://stripe.com/docs)
- Check `.env.example` for all available variables

---

**Last Updated:** 2026-01-26
