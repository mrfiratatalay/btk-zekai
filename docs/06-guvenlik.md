# Güvenlik

Bu sayfada sistemin kimliği, yetkiyi ve sırları nasıl ele aldığını, sonra da bildiğim eksikleri yazıyorum.
ZekAI bir hackathon haftasında yazıldı; aşağıdaki "bilinen eksikler" tablosu bu yüzden uzun ve onu saklamak
yerine açıkça yazmayı seçtim.

## Kimlik: iki ayrı JWT

Her ürünün kendi kimlik sistemi var:

| | `commerce-api` | `zekai-api` |
|---|---|---|
| Issuer / audience | `commerce-api` / `commerce-clients` | `zekai-api` / `zekai-clients` |
| Erişim token'ı | HS256 JWT, 24 saat | HS256 JWT, 24 saat |
| Yenileme token'ı | 64 bayt kriptografik rastgele, 30 gün | İki GUID'in birleşimi, 30 gün |
| Yenilemede | Eski token iptal, yenisi verilir | Eski token iptal, yenisi verilir |
| Şifre | BCrypt | BCrypt |

İki servisin sırları, issuer'ları ve audience'ları farklı; birinin token'ı diğerinde geçmiyor. `commerce-api`
yeni bir giriş ya da yenilemede kullanıcının eski bütün yenileme token'larını iptal ediyor, yani kullanıcı başına
tek aktif oturum kalıyor. Kod: [`AuthService`](../services/commerce-api/src/ZekAI.Infrastructure/Services/AuthService.cs).

Giriş hatasında iki durumda da aynı mesaj dönüyor ("E-posta veya şifre hatalı"); hangi e-postaların kayıtlı
olduğu mesajdan anlaşılmıyor.

## Mağaza bağlantısı: satıcının API anahtarı

**Problem.** ZekAI, satıcı adına pazar yerinde ürün okuyup güncellemeli; ama ZekAI'ın pazar yerindeki kullanıcı
şifresini bilmesi yanlış olurdu.

**Çözüm.** Akıllı Market her satıcıya `am_live_` ile başlayan bir API anahtarı veriyor; satıcı bunu kendi
panelinden görüyor ve isterse yeniliyor. Satıcı anahtarı ZekAI'a giriyor; `zekai-api` anahtarı önce
`commerce-api`'de doğruluyor, sonra bütün isteklerde `Authorization: Bearer <anahtar>` olarak gönderiyor.

`commerce-api` aynı başlıkta iki tür kimliği kabul ediyor. Küçük bir "policy scheme" token'ın biçimine bakıyor:
içinde nokta varsa JWT doğrulamasına, yoksa API anahtarı doğrulamasına yönlendiriyor. API anahtarıyla gelen istek
o satıcının kimliğiyle ve `Seller` rolüyle işleniyor. Kod:
[`Program.cs`](../services/commerce-api/src/ZekAI.Api/Program.cs),
[`ApiKeyAuthHandler`](../services/commerce-api/src/ZekAI.Api/Auth/ApiKeyAuthHandler.cs).

**Neden.** Satıcı ZekAI'dan ayrılmak istediğinde anahtarını yenilemesi yetiyor; şifresini değiştirmesi
gerekmiyor. Gerçek pazar yeri entegrasyonları da böyle çalışır.

**Bedeli.** Anahtar bir taşıyıcı (bearer) sır: ele geçiren, satıcının bütün ürünlerini değiştirebilir. Anahtarı
daraltılmış yetkilerle (yalnızca okuma gibi) vermek mümkün değil.

## Yetki ve veri izolasyonu

- Kullanıcının kimliği her zaman token'dan okunuyor (`ClaimTypes.NameIdentifier`); istek gövdesindeki bir
  kullanıcı kimliğine güvenilmiyor.
- Sorgular kullanıcıya göre süzülüyor: bir sipariş `o.Id == orderId && o.BuyerId == buyerId` ile aranıyor, bir
  taslak `d.UserId == userId` ile. Başkasının kaydını kimlikle istemek `404` döndürüyor.
- `commerce-api`'de rol kontrolü var: `/api/buyer/*` yalnızca `Buyer`, `/api/seller/*` yalnızca `Seller`.

## Sırlar ve yapay zekâ anahtarı

- Gemini anahtarı (`GOOGLE_API_KEY`) yalnızca `ai-service`'in ortamında duruyor; tarayıcı AI servisine hiç
  gitmiyor, her şey `zekai-api` üzerinden geçiyor. Anahtar tanımlı değilse AI uç noktaları anlaşılır bir
  mesajla `503` dönüyor.
- `.env` dosyaları `.gitignore`'da; repoda yalnızca `.env.example` var.

## Hata sözleşmesi

Controller'lar beklenen hataları yakalayıp durum koduna çeviriyor ve gövdede tek bir alan döndürüyor:

```json
{ "message": "Yalnızca bekleyen siparişler teslim alınabilir." }
```

| İstisna | Durum kodu |
|---|---|
| `KeyNotFoundException` | `404` |
| `InvalidOperationException` | `400` (kayıt ve yorumda `409`) |
| `UnauthorizedAccessException` | `401` |
| AI servisinden gelen hata | AI servisinin kendi kodu, `aiServiceStatus` alanıyla |

RFC 9457 Problem Details kullanmıyoruz ve genel bir hata yakalayıcı yok; beklenmeyen bir istisna `500` olarak
dönüyor. Bu da eksikler listesinde.

## Bilinen eksikler

| Eksik | Etkisi | Ne yapardım |
|---|---|---|
| JWT sırları, veritabanı şifresi ve revalidate sırrı `appsettings.json` ve `docker-compose.yml` içinde varsayılan değer olarak duruyor | Yerel geliştirme için kolay, ama aynı değerler bir sunucuya taşınırsa token sahtelenebilir | Değerleri yalnızca ortam değişkeninden okumak, varsayılan yoksa açılışta durmak |
| Satıcının API anahtarı `zekai_db`'de ve `commerce-api`'de düz metin | Veritabanı sızarsa anahtarlar da sızar | `commerce-api`'de anahtarın yalnızca özetini tutmak; `zekai-api`'de ASP.NET Data Protection ile şifrelemek |
| Yenileme token'ları düz metin | Veritabanı sızarsa oturumlar çalınabilir | Token'ın SHA-256 özetini saklamak |
| Vitrin yenileme sırrı (`zekai-revalidate-2024`) ZekAI arayüzünün koduna gömülü | Herkes Akıllı Market'in sayfa önbelleğini temizletebilir; veri değişmez ama gereksiz yük oluşur | Yenilemeyi yalnızca sunucudan tetiklemek |
| `zekai-api`'nin satıcı uç noktalarında rol kontrolü yok | Alıcı hesabı da çağırabilir; mağaza bağlantısı olmadığı için iş yapamaz ama kural kodda yazılı değil | `[Authorize(Roles = "Seller")]` |
| AI uç noktalarında istek sınırı (rate limit) yok | Bir kullanıcı Gemini faturasını şişirebilir | Kullanıcı başına dakikalık sınır, ASP.NET rate limiter |
| Stok düşümünde eşzamanlılık kontrolü yok | Aynı anda gelen iki sipariş son ürünü iki kez satabilir | Satıra sürüm kolonu (`xmin`) ile iyimser kilit |
| Sipariş numarası saniye hassasiyetinde | Aynı saniyede iki sipariş unique index'e çarpıp `500` döner | Numarayı sıra ya da rastgele ekle üretmek |
| Giriş süresi e-postanın var olup olmadığına göre değişiyor | Cevap süresinden kayıtlı e-postalar tahmin edilebilir | E-posta yoksa da sahte bir BCrypt karşılaştırması yapmak |
| Token'lar `localStorage`'da | Bir XSS açığı token'ı okuyabilir | HttpOnly çerez ve kısa ömürlü erişim token'ı |
| `ai-service` Google ADK'nin geliştirici arayüzünü açık başlatıyor (`web=True`) | Servis internete açılırsa ajanlar bu arayüzden çağrılabilir | Üretimde `web=False` |
| Test yok | Bu kuralların hiçbiri otomatik olarak korunmuyor | Önce karar motoru ve paket fiyatlaması için birim testleri |

Bu listedeki her madde gerçek bir mülakat sorusu olabilir. Birkaçının çözümünü (zamanlamaya dayanıklı giriş,
özeti saklanan token, HttpOnly çerez) başka projelerimde uyguladım.
Öncelik sırası: [Sorular ve sınırlar](12-sorular-ve-sinirlar.md#yol-haritası).
