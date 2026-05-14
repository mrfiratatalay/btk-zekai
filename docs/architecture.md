---
---

# Hackathon Projesi — Kullanacağımız Teknolojiler

Bu projede teknolojileri rastgele seçmiyoruz. Amacımız hem hızlı geliştirme yapmak hem de jüriye teknik olarak sağlam, mantıklı ve anlatılabilir bir mimari göstermek. Yarışmada Gemini merkezli çalışan, gerçek kullanıcı problemini çözen ve mümkünse agentic yapı içeren bir ürün bekleniyor; teknik seçimlerimizi de buna göre yapıyoruz.

Genel teknoloji mimarimiz şu olacak:

```txt
Frontend:
Next.js + TypeScript + shadcn/ui

Main Backend:
ASP.NET Core + EF Core + SignalR

AI Backend:
Python FastAPI + Google Gen AI SDK + Google ADK + Gemini API

Database:
PostgreSQL + pgvector

Cache / Job State:
Redis

Container:
Docker Compose
```

---

# 1. Frontend: Next.js + TypeScript + shadcn/ui

Frontend tarafında **Next.js** kullanacağız. Çünkü uygulamamız sadece tek sayfalık basit bir demo olmayacak. Mock e-ticaret sitesi, ürün detay sayfası, alıcı analiz ekranı, satıcı paneli, hakem paneli ve agent akışı gibi farklı ekranlarımız olacak. Next.js bu çok sayfalı yapıyı düzenli kurmamızı sağlar.

**TypeScript** kullanacağız. Çünkü proje büyüdükçe frontend tarafında veri yapıları karışacak: ürün, yorum, analiz sonucu, skorlar, ajan durumları, satıcı bilgileri gibi birçok model olacak. TypeScript sayesinde yanlış veri kullanımını daha erken fark ederiz.

Ana UI/design library olarak **shadcn/ui** kullanacağız. Bu projeye Ant Design, MUI veya Chakra yerine shadcn/ui daha uygun. Çünkü hazır admin panel gibi görünmek istemiyoruz. Modern, sade, premium ve AI dashboard hissi veren bir arayüz kurmak istiyoruz. shadcn/ui bize hem hızlı component üretme imkânı verir hem de tasarımı istediğimiz gibi özelleştirmemizi sağlar.

Frontend tarafındaki temel yardımcı kütüphaneler:

```txt
Next.js
TypeScript
shadcn/ui
Tailwind CSS
TanStack Query
Zustand
React Hook Form
Zod
React Flow
Recharts
Framer Motion
lucide-react
```

Burada Tailwind ve Radix’i ayrı design library gibi düşünmüyoruz. shadcn/ui zaten Tailwind/Radix altyapısıyla çalışıyor. Bizim tasarım kütüphanesi kararımız tek: **shadcn/ui**.

**TanStack Query** backend’den veri çekme, loading/error durumları ve cache için kullanılacak.

**Zustand** küçük global state işleri için kullanılacak. Örneğin aktif kullanıcı modu, seçili ürün, açık analiz paneli gibi durumları tutacağız.

**React Flow** çok önemli. Agentic AI akışını görsel olarak göstermek için kullanacağız. Mesela “Kullanıcı İhtiyacı Ajanı çalıştı”, “Yorum Analiz Ajanı çalıştı”, “Doğrulama Ajanı sonucu kontrol etti” gibi süreci ekranda canlı göstereceğiz. Önceki teknik planımızda da agent ağacını görünür kılmanın demo açısından güçlü olacağı özellikle vurgulanmıştı.

**Recharts** fiyat geçmişi, yorum dağılımı, iade risk grafiği, güven skoru gibi grafikler için kullanılacak.

**Framer Motion** küçük animasyonlar için kullanılacak. Aşırı animasyon yapmayacağız ama agent akışında, skor kartlarında ve sentetik müşteri panelinde daha canlı bir his verebilir.

---

# 2. Main Backend: ASP.NET Core

Ana backend tarafında **ASP.NET Core** kullanacağız.

Bu backend bizim sistemin ana omurgası olacak. Frontend doğrudan AI servisine gitmeyecek. Frontend önce ASP.NET Core backend ile konuşacak. Bu backend de gerektiğinde AI servisine istek gönderecek.

ASP.NET Core tarafı şu işlerden sorumlu olacak:

```txt
Kullanıcı işlemleri
Satıcı işlemleri
Ürün işlemleri
Yorum işlemleri
Sipariş ve iade işlemleri
Analiz isteği oluşturma
Analiz sonucunu kaydetme
Skor hesaplama
SignalR ile canlı agent durumu gönderme
Veritabanı erişimi
Redis erişimi
```

Yani klasik backend işlerinin tamamı ASP.NET Core tarafında olacak.

Bu tarafta kullanacağımız ana teknolojiler:

```txt
ASP.NET Core
EF Core
Npgsql EF Core Provider
SignalR
FluentValidation
Serilog
Swagger / Scalar
Clean Architecture / Modular Monolith
```

**EF Core** veritabanı ile konuşmak için kullanılacak. MSSQL kullansaydık farklı provider kullanacaktık; PostgreSQL kullandığımız için **Npgsql.EntityFrameworkCore.PostgreSQL** provider’ını kullanacağız. Bu garip veya riskli bir şey değil; Npgsql’in resmi dokümanı bunun PostgreSQL için EF Core provider olduğunu söylüyor. ([Npgsql][1])

**SignalR** canlı agent durumlarını frontend’e göndermek için kullanılacak. Örneğin kullanıcı analiz başlattığında ekranda şu adımlar canlı görünecek:

```txt
✓ Kullanıcı ihtiyacı analiz edildi
✓ Ürün bilgileri incelendi
✓ Yorumlar tarandı
✓ Fiyat geçmişi kontrol edildi
✓ İade riski hesaplandı
✓ Sonuç doğrulandı
```

Bu demo açısından güçlü bir detay olacak.

**FluentValidation** request doğrulama için kullanılacak. Örneğin ürün oluştururken başlık boş mu, fiyat geçerli mi, analiz isteğinde userNeed alanı var mı gibi kontrolleri temiz şekilde burada yapacağız.

**Serilog** loglama için kullanılacak. Hata olduğunda neyin nerede bozulduğunu daha rahat göreceğiz.

Mimari olarak **Modular Monolith + Clean Architecture** kullanacağız. Yani 10 tane mikroservis açıp projeyi gereksiz karmaşık hale getirmeyeceğiz. Tek ana backend olacak ama içeride modüller ayrılacak:

```txt
Auth Module
Catalog Module
Review Module
Seller Module
Order Module
Return Module
Analysis Module
Scoring Module
Arbitration Module
```

Bu yaklaşım hem hızlı geliştirmeye uygun hem de teknik olarak düzenli görünür. Önceki teknik notlarımızda da iki ayrı backend’in yeterli olduğu, ana backend’in ASP.NET Core, AI servisinin Python olması gerektiği belirtilmişti.

---

# 3. AI Backend: Python FastAPI + Google ADK + Gemini

AI tarafını ana backend’in içine gömmeyeceğiz. Ayrı bir **Python FastAPI AI Service** olacak.

Bunun sebebi şu: Ürün, kullanıcı, sipariş, skor ve veritabanı işleri .NET tarafında daha düzenli duruyor. Ama Gemini, görsel analiz, yorum analizi, agentic workflow, embedding ve AI araçları Python tarafında daha rahat ilerliyor.

AI servisinde kullanacağımız ana teknolojiler:

```txt
Python FastAPI
Google Gen AI SDK
Google ADK
Gemini API
Pydantic
Pillow / OpenCV
scikit-learn
httpx
```

**FastAPI**, AI servisinin HTTP API’sini oluşturacak. ASP.NET Core backend bu servise istek gönderecek. Örneğin “şu ürün, şu yorumlar, şu kullanıcı ihtiyacı için analiz yap” diye JSON payload gönderecek.

**Google Gen AI SDK**, Gemini modellerine erişmek için kullanılacak. Google, Gemini API kullanımı için Google Gen AI SDK’yı resmi ve üretim odaklı kütüphane olarak öneriyor. ([Google AI for Developers][2])

**Gemini API**, projenin ana yapay zekâ modeli olacak. Gemini’yi sadece sohbet cevabı üretmek için değil; ürün açıklaması, ürün görseli, yorumlar, kullanıcı ihtiyacı ve iade senaryolarını analiz etmek için kullanacağız.

**Google ADK**, yani Agent Development Kit, agentic yapı kurmak için kullanacağımız ana framework olacak. Google ADK resmi olarak AI agent’ları build/debug/deploy etmek için açık kaynak bir framework olarak tanımlanıyor ve basit asistanlardan multi-agent workflow’lara kadar kullanılabiliyor. ([Google Cloud Documentation][3]) ADK’nın Gemini ile çalışması da bizim için stratejik olarak iyi; çünkü yarışmada Gemini merkezli bir ürün geliştirmek istiyoruz.

Daha önce LangGraph’i de konuşmuştuk. LangGraph iyi bir seçenekti ama son kararımız şu:

```txt
Ana agent framework: Google ADK
Yedek/alternatif framework: LangGraph
```

Bunun sebebi, yarışmanın Google/Gemini ekosistemiyle güçlü bağlantısı olması. Bu yüzden AI servisinde Google Gen AI SDK + Google ADK + Gemini API çizgisi daha temiz ve daha anlatılabilir.

AI servisinde çalışacak ajan mantığı kabaca şöyle olacak:

```txt
Kullanıcı İhtiyacı Ajanı
Ürün Gerçekliği Ajanı
Yorum Analiz Ajanı
Görsel Analiz Ajanı
Fiyat Analiz Ajanı
İade Riski Ajanı
Satıcı İyileştirme Ajanı
Hakem Ajanı
Doğrulama Ajanı
```

Hepsi her zaman çalışmayacak. Hangi ekrandaysak, hangi analiz isteniyorsa, ona göre ilgili ajanlar çalışacak.

Önemli nokta şu: Gemini’nin verdiği her cevap doğrudan final karar olmayacak. AI servisinden gelen veri önce yapılandırılmış sonuç olarak dönecek. Son karar ve skorlar büyük ölçüde .NET tarafındaki deterministic scoring engine ile hesaplanacak. Önceki teknik planımızda da kritik skorların serbest LLM cevabına bırakılmaması gerektiği özellikle belirtilmişti.

---

# 4. Database: PostgreSQL + pgvector

Veritabanı olarak **PostgreSQL** kullanacağız.

MSSQL de kullanılabilirdi. Özellikle klasik e-ticaret tabloları için MSSQL gayet yeterli olurdu. Ama bizim projede sadece kullanıcı, ürün ve yorum tutmayacağız. Aynı zamanda yorum embedding’leri, benzer şikâyet kümeleri, ürün-ihtiyaç semantik araması, bot yorum benzerliği gibi AI tarafına yakın veriler de olacak.

Bu yüzden PostgreSQL + pgvector daha mantıklı.

**pgvector**, PostgreSQL içinde vector similarity search yapmamızı sağlar. Yani yorumları embedding’e çevirip “bu kullanıcının ihtiyacına en yakın yorumlar hangileri?”, “mikrofonla ilgili benzer şikâyetler var mı?”, “bu yorumlar birbirine çok benziyor mu?” gibi sorgular yapabiliriz. pgvector dokümantasyonu vector verileri Postgres içinde tutup exact/approximate nearest neighbor search ve cosine distance gibi metrikleri desteklediğini belirtiyor. ([GitHub][4])

Database tarafında kullanacağımız yapı:

```txt
PostgreSQL
pgvector extension
EF Core
Npgsql EF Core Provider
```

Başlangıçta tutacağımız tablolar kabaca şunlar olacak:

```txt
users
sellers
categories
products
product_images
reviews
review_embeddings
price_history
orders
returns
arbitration_cases
analysis_requests
analysis_results
agent_runs
synthetic_personas
analysis_cache
```

Burada önemli karar şu:

> Veritabanının ana sahibi ASP.NET Core backend olacak. Python AI servisi doğrudan veritabanını yönetmeyecek.

Yani AI servisi veritabanına istediği gibi girip çıkmayacak. .NET backend ürünü, yorumları, fiyat geçmişini ve gerekli verileri DB’den alacak; sonra AI servisine düzenli JSON olarak gönderecek. AI sonucu döndüğünde sonucu yine .NET backend kaydedecek.

Bu sayede sistem daha kontrollü olur.

---

# 5. Redis

**Redis** kısa süreli cache ve job state için kullanılacak.

Kullanım alanları:

```txt
Analiz işlem durumu
Agent progress state
Kısa süreli cache
Rate limiting altyapısı
```

Örneğin kullanıcı “Bana uygun mu?” dediğinde analiz birkaç saniye sürebilir. Bu sırada her adımı Redis’te tutup SignalR ile frontend’e gönderebiliriz.

Redis’i ana veritabanı gibi kullanmayacağız. Kalıcı veriler PostgreSQL’de kalacak. Redis sadece hızlı erişim ve geçici durumlar için kullanılacak.

---

# 6. Docker Compose

Projeyi Docker Compose ile ayağa kaldıracağız.

Çünkü sistem birden fazla parçadan oluşuyor:

```txt
frontend
backend-api
ai-service
postgres
redis
```

Docker Compose bu servisleri tek bir YAML dosyasında tanımlamamızı ve tek komutla çalıştırmamızı sağlar. Docker’ın resmi dokümantasyonu da Compose’u multi-container uygulamaları tanımlamak ve çalıştırmak için kullanılan araç olarak açıklar. ([Docker Documentation][5])

Geliştirme sırasında şu komutla tüm sistemi ayağa kaldırmayı hedefliyoruz:

```bash
docker compose up --build
```

Bu sayede “bende çalışıyor, sende çalışmıyor” problemi azalır. Frontend, backend, AI servisi, PostgreSQL ve Redis aynı ortamda ayağa kalkar.

Docker servisleri:

```txt
web:
Next.js frontend

api:
ASP.NET Core backend

ai-service:
Python FastAPI + Google ADK + Gemini

postgres:
PostgreSQL + pgvector

redis:
Cache ve job state
```

Opsiyonel olarak geliştirme ortamında şunları da ekleyebiliriz:

```txt
pgAdmin:
Veritabanını görsel olarak incelemek için

Seq:
Logları daha rahat takip etmek için
```

Ama ilk MVP için zorunlu parçalar: **web, api, ai-service, postgres, redis**.

---

# 7. Son teknoloji kararımız

Final teknoloji stack’imiz şu:

```txt
Frontend:
Next.js
TypeScript
shadcn/ui
Tailwind CSS
TanStack Query
Zustand
React Hook Form
Zod
React Flow
Recharts
Framer Motion
lucide-react

Main Backend:
ASP.NET Core
EF Core
Npgsql.EntityFrameworkCore.PostgreSQL
SignalR
FluentValidation
Serilog
Swagger / Scalar
Clean Architecture
Modular Monolith

AI Backend:
Python FastAPI
Google Gen AI SDK
Google ADK
Gemini API
Pydantic
Pillow / OpenCV
scikit-learn
httpx

Database:
PostgreSQL
pgvector

Cache / Job State:
Redis

Container / Runtime:
Docker Compose
```

---

# 8. Mimariyi tek cümlede anlatırsak

> Frontend’i Next.js ve shadcn/ui ile geliştiriyoruz. Ana backend’i ASP.NET Core ile kuruyoruz; ürün, kullanıcı, satıcı, yorum, iade ve skor hesaplama gibi klasik sistem işleri burada olacak. AI tarafını ayrı bir Python FastAPI servisi olarak tasarlıyoruz; Gemini API’ye Google Gen AI SDK ile erişip agentic akışı Google ADK ile yöneteceğiz. Veritabanında PostgreSQL + pgvector kullanacağız; böylece hem klasik e-ticaret verilerini hem de yorum embedding’lerini aynı sistemde tutabileceğiz. Redis kısa süreli cache ve analiz durumları için, Docker Compose ise tüm sistemi tek komutla ayağa kaldırmak için kullanılacak.

Bu teknoloji seçimiyle her parça kendi güçlü olduğu yerde duruyor: **Next.js arayüzü, ASP.NET Core sistem omurgasını, Python + Gemini AI motorunu, PostgreSQL + pgvector veri zekâsını, Docker Compose ise çalıştırma düzenini taşıyor.**

[1]: https://www.npgsql.org/efcore/?utm_source=chatgpt.com 'Npgsql Entity Framework Core Provider'
[2]: https://ai.google.dev/gemini-api/docs/libraries?utm_source=chatgpt.com 'Gemini API libraries - Google AI for Developers'
[3]: https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/adk?utm_source=chatgpt.com 'Agent Development Kit | Gemini Enterprise Agent Platform'
[4]: https://github.com/pgvector/pgvector?utm_source=chatgpt.com 'pgvector/pgvector: Open-source vector similarity search for ...'
[5]: https://docs.docker.com/compose/?utm_source=chatgpt.com 'Docker Compose'
