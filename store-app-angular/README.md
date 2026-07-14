# متجر - Angular Frontend

فرونت إند الموقع (Angular 17، standalone components + signals). دلوقتي بيتصل بـ **backend
حقيقي** (Node.js + Express + قاعدة بيانات SQLite) بدل ما كان بيحفظ في `localStorage`.

## ⚠️ لازم تشغّل الـ backend الأول

الموقع ده لوحده مش هيشتغل صح — لازم مشروع `store-app-backend` يكون شغال جنبه.
اقرأ `store-app-backend/README.md` — فيه شرح كامل خطوة بخطوة (إيه هو الـ backend،
إيه هي الـ database، إزاي شغّال الـ authentication، وإزاي تشغّل كل حاجة).

## التشغيل السريع

```bash
# 1) شغّل الـ backend الأول (في نافذة Terminal منفصلة)
cd store-app-backend
npm install
cp .env.example .env
npm start

# 2) بعدين شغّل الموقع (في نافذة تانية)
cd store-app-angular
npm install
ng serve -o
```

يفتح على `http://localhost:4200`، وهيجيب المنتجات والإعدادات من الـ backend الشغال على
`http://localhost:4000` تلقائياً.

## من فين بيجيب البيانات؟

- `src/environments/environment.ts` — فيه عنوان الـ backend (`apiUrl`). لو شغّلت الـ
  backend على بورت مختلف أو رفعته على سيرفر، غيّر القيمة دي.
- `src/app/services/api.service.ts` — كل نداءات الـ HTTP للـ backend (المنتجات، الطلبات،
  الإعدادات، تسجيل الدخول) في مكان واحد.
- `src/app/services/auth.service.ts` — بيحفظ توكن تسجيل الدخول (JWT) وبيدير حالة
  "الأدمن مسجل دخوله ولا لأ".
- `src/app/services/store.service.ts` — الحالة المركزية لكل الموقع، بتنادي على
  `ApiService` بدل ما تخزّن في المتصفح.

## البنية

- `src/app/models.ts` — الأنواع (Product, Order, ...)
- `src/app/data.ts` — ثوابت واجهة فقط (تصنيفات، فلاتر، حالات الطلب) — البيانات الفعلية
  (منتجات/طلبات/إعدادات) بقت جايه من الـ backend
- `src/app/helpers.ts` — money / genId / isValidSaudiPhone
- `src/app/shared/*` — عناصر مشتركة صغيرة (Badge, Stepper, EmptyState, Toast, ErrorBanner)
- `src/app/components/*` — Header (top navbar), Footer, WhatsAppFloat, ProductCard
- `src/app/pages/*` — كل الصفحات (Home, Products/Category, ProductDetail, Cart, Checkout,
  OrderSuccess, Contact, AdminLogin, AdminDashboard)
- `src/app/app.component.ts` — الجذر: التنقّل بين الصفحات، عرض شل الأدمن المنفصل، الأخطاء
- `src/styles.css` — تصميم الموقع بالكامل (top navbar، full-width responsive layout)

## الأيقونات

مكتبة `lucide-angular` (نفس مكتبة lucide-react لكن نسخة Angular).

## تسجيل دخول الأدمن

كلمة السر هي اللي محطوطة في `store-app-backend/.env` (متغيّر
`ADMIN_PASSWORD`) — مش في كود الفرونت إند خالص، عشان محدش يقدر يشوفها من المتصفح.
