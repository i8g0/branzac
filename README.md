# BRANZAG | برانزاك

منصة طلبات رقمية لكافيه قهوة مختصة — Vite + React + Supabase، محسّنة للأداء وVercel.

## التشغيل المحلي

```bash
npm install
cp .env.example .env
npm run dev
```

## المتغيرات البيئية

| المتغير | الوصف |
|---------|--------|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام (anon) |

## البناء والنشر

```bash
npm run build
npm run preview
```

انشر على [Vercel](https://vercel.com) — `vercel.json` يوجّه كل المسارات إلى SPA.

## البنية

```
src/
  store/cartStore.js    # Zustand + persist
  hooks/                # scroll, logo, about, debounce
  components/ui/        # PremiumImage, CartToast
  lib/                  # supabase, motion, performance
```

## لوحة الإدارة

`/admin` — إدارة الطلبات، المنيو، الشرائح، والرسائل.

### حماية لوحة التحكم

عيّن `VITE_ADMIN_PIN` في `.env` — سيُطلب الرمز عند فتح `/admin`.

### تحسين تحميل الصور (اختياري)

نفّذ في Supabase SQL Editor:

```sql
-- ملف: supabase/blur_data.sql
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS blur_data text;
```

عند رفع صور من لوحة الإدارة يُولَّد blur تلقائياً.
