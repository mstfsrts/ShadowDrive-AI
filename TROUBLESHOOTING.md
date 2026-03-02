# ShadowDrive AI — Sorun Giderme

## "Cannot read properties of undefined (reading 'call')" / Hydration hatası

Bu hata genelde **Next.js dev önbelleği** (.next) bozulduğunda veya tarayıcı eklentisi script enjekte ettiğinde görülür.

### Yapılacaklar (sırayla)

1. **Dev sunucusunu durdurun** (terminalde Ctrl+C).

2. **Önbelleği silin ve dev’i yeniden başlatın:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Tarayıcıda sayfayı sert yenileyin:** Ctrl+Shift+R (Windows/Linux) veya Cmd+Shift+R (Mac).

4. Hata sürüyorsa **eklentileri kapatın:** Console Ninja veya başka script enjekte eden eklentiler hydration’ı bozabilir. Gizli pencere (incognito) veya eklentisiz bir profil ile deneyin.

5. **Production build’in çalıştığını doğrulayın:**
   ```bash
   rm -rf .next
   npm run build
   npm run start
   ```
   Build başarılı ve `npm run start` ile uygulama açılıyorsa sorun yalnızca dev ortamıyla sınırlıdır.

### Not

- `__tests__/` ve `vitest.config.ts` yalnızca testler için kullanılır; Next.js bunları uygulama paketine dahil etmez.
- Yapılan son değişiklikler (ScenarioForm 48px, AudioPlayer 88px, yeni testler) production build’i bozmaz; `npm run build` ile doğrulanabilir.
