# Galatasaray Kadro Tahtası 🟡🔴

Galatasaray'ın A takım oyuncularıyla kendi ilk 11'ini oluşturabileceğin, dizilişleri deneyebileceğin ve oyunculara görev atayabileceğin Türkçe bir taktik tahtası.

**Kadro doğrulama tarihi: 18 Ekim 2026 · 32 oyuncu · 11 saha oyuncusu · 21 yedek**

Oyuncu adları, forma numaraları, mevki grupları ve fotoğraflar [Galatasaray'ın resmî A takım sayfasından](https://www.galatasaray.org/pl/futbol-takim-kadrosu/9) alınmıştır. Başlangıçtaki ilk 11, kaptan ve duran top seçimleri uygulamanın örnek tercihleridir; kulübün açıklanmış maç kadrosu değildir. Detaylı taktik rol etiketleri uygulama içi yardımcı tanımlardır.

## Neden yapıldı?

Bir oyuncu listesini okumak, farklı ilk 11'leri sahada karşılaştırmaya yetmiyor. Bu proje; oyuncuları saha üzerinde konumlandırmayı, dizilişi değiştirmeyi ve yedeklerle alternatifler denemeyi tek ekranda bir araya getiriyor. Sarı-kırmızı vurgular takım kimliğini, yeşil saha ise oyuncuların yerleşimini öne çıkarıyor.

## Ekran görüntüleri ve tasarım kararları

### Masaüstü: saha ve kadro havuzu birlikte

![Galatasaray Kadro Tahtası masaüstü görünümü](docs/screenshots/masaustu.png)

Saha geniş alanda, yedek kulübesi sağda tutuldu. Böylece oyuncu seçerken diziliş görünür kalıyor. Üstteki diziliş düğmeleri koordinat şablonlarını uyguluyor; oyuncuları elle taşımak ise “Özel” diziliş oluşturuyor. K, P ve F rozetleri kaptanı, penaltıcıyı ve frikikçiyi gösteriyor.

### Oyuncu değişikliği: seç, ara, yerleştir

![Oyuncu seçimi ve arama ile değişiklik akışı](docs/screenshots/oyuncu-degisikligi.png)

Önce sahadaki oyuncuya, ardından yedekteki oyuncuya tıklanıyor. Seçili oyuncu ve açıklama kutusu hangi pozisyonda değişiklik yapılacağını gösteriyor. Örnekte Leão sahaya alınmış, kaptan seçilmiş ve Deniz Gül aranmış durumda. İsim/numara araması ve mevki filtreleri uzun oyuncu listesini daraltıyor. Masaüstünde yedek oyuncuyu sahaya sürükleyip bırakmak da mümkün.

### Mobil: dikey kullanım

<img src="docs/screenshots/mobil.png" alt="390 piksel genişliğinde mobil görünüm: saha ve altında yedek kulübesi" width="320" />

Dar ekranda paneller alt alta geliyor, oyuncu kartları küçülüyor ve temel eylemler korunuyor. Yedekten oyuncu değiştirmek için dokunarak seçim yapılabiliyor. Saha koordinatları yüzdeyle tutulduğu için yerleşim ekran boyutuna uyum sağlıyor.

## Özellikler

- 4-2-3-1, 4-3-3, 4-4-2, 3-4-2-1 ve 3-5-2 dizilişleri.
- Saha üzerinde serbest oyuncu taşıma ve yedekten değişiklik.
- Türkçe karakterleri destekleyen isim/forma numarası araması ve mevki filtreleri.
- Kaptan, penaltı ve frikik görevi atama.
- Kadroyu tarayıcının `localStorage` alanına otomatik kaydetme ve varsayılana dönme.
- Resmî kaynaktan kadro ve fotoğraf güncelleme komutu.

## Nasıl yapıldı?

Arayüz **React 19 + TypeScript** ile geliştirildi. Next.js App Router yapısını Vite üzerinde çalıştıran **vinext**, geliştirme ve üretim derlemesini yönetiyor. Görsel düzen CSS Grid/Flex, medya sorguları ve CSS değişkenleriyle oluşturuldu; Tailwind CSS de proje altyapısında bulunuyor.

Oyuncu verisi arayüzden ayrılarak `data/roster.json` dosyasında tutuluyor. İlk 11; oyuncu kimliği ve yüzde cinsinden `x/y` koordinatlarından oluşuyor. Diziliş seçimi bu koordinatları değiştiriyor; yedekten değişiklik ise seçilen slotun oyuncusunu değiştiriyor. Pointer olayları saha üzerinde taşımayı, HTML sürükle-bırak olayları masaüstünde yedekten eklemeyi sağlıyor.

Kadro tarayıcıda saklandığı için bu özellikler bir hesap veya veritabanı gerektirmiyor. Geçersiz kayıtlar kontrol ediliyor; tarayıcı verileri silindiğinde kaydedilen kadro da silinir. Projedeki D1/Drizzle örnekleri başlangıç altyapısından geliyor ve kadro tahtasında kullanılmıyor.

```text
app/page.tsx                  Etkileşimler, saha ve oyuncu kartları
app/globals.css               Takım renkleri, saha çizgileri ve mobil düzen
data/roster.json              Kaynak, kontrol tarihi ve oyuncu verisi
public/players/               Yerel oyuncu fotoğrafları
scripts/update-roster.mjs     Resmî sayfadan veri/fotoğraf güncelleme
scripts/capture-screenshots.mjs  Tarayıcı kontrolleri ve ekran görüntüleri
tests/rendered-html.test.mjs  Veri bütünlüğü ve üretim HTML kontrolleri
docs/screenshots/             README ekran görüntüleri
```

## Yerel çalıştırma

Node.js **22.13 veya üzeri** gerekir.

```bash
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi aç. Windows'ta bağımlılıkları kurduktan sonra `Siteyi Baslat.cmd` dosyası da kullanılabilir.

```bash
npm run build   # Üretim derlemesi
npm start       # Üretim sunucusu
npm run lint    # Kod kontrolü
npm test        # Derleme + kadro ve sunucuda oluşturulan HTML testleri
```

## Kadroyu güncelleme

```bash
npm run roster:update
npm test
```

Güncelleme komutu resmî sayfadaki oyuncu adını, numarasını, mevki grubunu ve fotoğrafını alır; kontrol tarihini yeniler. Mevcut oyuncuların kısa adlarını ve taktik rol etiketlerini korur. Yeni oyunculara genel bir rol verir; ayrıntılı rol ve kısa adlar JSON dosyasında düzenlenebilir. Kaynakta beklenmeyen yapı veya eksik fotoğraf varsa işlem hata verir; veri dosyası değiştirilmez.

Bu işlem zamanlanmış veya canlı bir senkronizasyon değildir. Resmî sayfa değiştiğinde komut yeniden çalıştırılmalı, değişiklikler incelenmeli ve yeni sürüm yayımlanmalıdır.

## Ekran görüntülerini yeniden oluşturma

Geliştirme sunucusu çalışırken ve Google Chrome kuruluysa:

```bash
node scripts/capture-screenshots.mjs
```

Komut; 11 kişilik saha, yedek sayısı, fotoğraflar, diziliş değişimi, oyuncu değişikliği, kaptan seçimi, yenileme sonrası kalıcılık ve mobil taşma kontrolünü yaparak üç PNG oluşturur. Farklı adres için `PREVIEW_URL` ortam değişkeni kullanılabilir.

## Kaynak ve kullanım notu

Bağımsız bir taraftar projesidir; Galatasaray Spor Kulübü'nün resmî uygulaması değildir. Oyuncu fotoğrafları ve kulüple ilişkili görsel haklar ilgili hak sahiplerine aittir. Kaynak bağlantıları `data/roster.json` içinde de bulunur.
