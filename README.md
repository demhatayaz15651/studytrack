# StudyTrack — Öğrenci Ödev ve Sınav Takip Uygulaması

## Proje Tanımı

**Çözdüğü Problem:** Üniversite öğrencileri dönem boyunca birden fazla derse ait ödev, proje ve sınav teslim tarihlerini farklı platformlarda (e-posta, LMS, not defteri) takip etmeye çalışırken son teslim tarihlerini gözden kaçırabilmektedir. **StudyTrack**, öğrencilerin tüm ders görevlerini tek bir sade arayüzde toplamasına, tamamlama durumlarını izlemesine ve yaklaşan/geciken teslim tarihleri için anlık görsel uyarılar almasına olanak tanır.

**Hedef Kitle:** Ders yükünü, ödevlerini ve sınav takvimini kurulum gerektirmeyen hafif bir web aracıyla düzenli biçimde takip etmek isteyen üniversite ve lise öğrencileri.

---

## İş Takip Panosu (GitHub Projects)

- **Pano Bağlantısı:** [StudyTrack İş Takip Panosu](https://github.com/users/demhatayaz15651/projects/1)
- **Sütunlar:** `Yapılacak` · `Devam Ediyor` · `Tamamlandı`
- **Planlanan Görevler (6 Görev):**
  1. [#1 — Ödev ve Sınav Ekleme, Listeleme, Tamamlama ve Silme](https://github.com/demhatayaz15651/studytrack/issues/1) *(Tamamlandı — [PR #7](https://github.com/demhatayaz15651/studytrack/pull/7))*
  2. [#2 — Ders/Durum Filtreleme, Arama, Sıralama ve Yaklaşan Teslim Tarihi Uyarıları](https://github.com/demhatayaz15651/studytrack/issues/2) *(Tamamlandı — [PR #8](https://github.com/demhatayaz15651/studytrack/pull/8))*
  3. [#3 — Mevcut Ödev ve Sınav Kayıtlarını Düzenleme](https://github.com/demhatayaz15651/studytrack/issues/3) *(Yapılacak)*
  4. [#4 — Aylık Takvim Görünümü ile Teslim Tarihlerini Görselleştirme](https://github.com/demhatayaz15651/studytrack/issues/4) *(Yapılacak)*
  5. [#5 — Görev Listesini JSON / CSV Olarak Dışa ve İçe Aktarma](https://github.com/demhatayaz15651/studytrack/issues/5) *(Yapılacak)*
  6. [#6 — Çalışma Oturumu İçin Entegre Pomodoro Zamanlayıcısı](https://github.com/demhatayaz15651/studytrack/issues/6) *(Yapılacak)*

---

## Projeyi Çalıştırma Adımları

Bu proje saf **HTML5 / CSS3 / Vanilla JavaScript** ile geliştirilmiştir; harici paket kurulumu (`npm install` vb.) gerektirmez.

### Yöntem 1: Doğrudan Tarayıcıda Açma (Önerilen)
1. Depoyu bilgisayarınıza klonlayın veya ZIP olarak indirin:
   ```bash
   git clone https://github.com/demhatayaz15651/studytrack.git
   cd studytrack
   ```
2. Proje klasöründeki `index.html` dosyasına çift tıklayarak herhangi bir modern tarayıcıda (Chrome, Edge, Firefox) açın.

### Yöntem 2: Yerel HTTP Sunucusu ile Çalıştırma (İsteğe Bağlı)
```bash
python -m http.server 8000
```
Tarayıcıda `http://localhost:8000` adresine gidin.

### Otomatik İş Mantığı Testlerini Çalıştırma (İsteğe Bağlı)
Node.js (v18+) kuruluysa proje kök dizininde ek kurulum yapmadan birim testlerini çalıştırabilirsiniz:
```bash
node --test tests/core.test.js
```

---

## Geliştirilen İki Özellik ve Nasıl Denenebilir?

### Özellik 1: Ödev ve Sınav Ekleme, Listeleme, Tamamlama, Silme ve Kalıcılık
1. `index.html` dosyasını tarayıcıda açın.
2. Sol paneldeki **Yeni Görev Ekle** formunu boş bırakarak **"+ Görev Ekle"** butonuna tıklayın; başlık, ders adı ve teslim tarihi için Türkçe doğrulama uyarılarının göründüğünü doğrulayın.
3. Örnek bir görev girin (ör. Başlık: *DevOps Final Sunumu*, Ders: *Yazılım Geliştirme ve DevOps*, Tür: *Proje*, Öncelik: *Yüksek*, Teslim Tarihi: yarının tarihi) ve **"+ Görev Ekle"** butonuna tıklayın; görevin anında sağdaki listede göründüğünü doğrulayın.
4. Eklediğiniz görevin solundaki onay kutusunu (checkbox) işaretleyin; görevin üzeri çizilerek **Tamamlandı** durumuna geçtiğini ve tekrar tıklayınca **Bekleyen** durumuna döndüğünü gözlemleyin.
5. Sayfayı yenileyin (`F5`); verilerin `localStorage` üzerinden korunduğunu doğrulayın.
6. Bir görevin sağındaki **"Sil"** butonuna tıklayarak kaydın listeden kaldırıldığını test edin.

### Özellik 2: Ders/Durum Filtreleme, Arama, Sıralama ve Yaklaşan Teslim Tarihi Uyarıları
1. Farklı tarih ve derslere sahip verileri tek tıkla görmek için sağ üstteki **"Örnek Veri Yükle"** butonuna tıklayın *(veya kendiniz geçmiş, 1-3 gün içinde ve 7+ gün sonraki tarihlerde görevler ekleyin)*.
2. Görev kartlarındaki teslim rozetlerini inceleyin:
   - Teslim tarihi geçmiş görevler kırmızı **"X gün gecikti"** rozeti ve kırmızı sol şeritle,
   - Bugün veya 3 gün içinde teslim edilecek görevler turuncu **"Son gün (Bugün!)" / "X gün kaldı (Acil)"** rozetiyle,
   - İleri tarihli görevler mavi **"X gün kaldı"** rozetiyle gösterilir.
3. Üstteki **Özet İstatistik Kartlarının** (Toplam, Bekleyen, Yaklaşan ≤3 Gün, Geciken, Tamamlanan), **Genel İlerleme Çubuğunun** ve **Yaklaşan Teslim Tarihi Uyarı Şeridinin** gerçek zamanlı güncellendiğini (bir geciken görevi tamamlandı işaretleyerek) gözlemleyin.
4. **Durum**, **Ders** ve **Tür** açılır listelerini değiştirerek ve **Arama** kutusuna (ör. `"işletim"` veya `"SQL"`) yazarak listenin anlık filtrelendiğini test edin; **Sıralama** seçicisiyle teslim tarihine veya önceliğe göre sıralayın.
5. **"Filtreleri Sıfırla"** butonuna tıklayarak tüm filtrelerin tek seferde temizlendiğini doğrulayın.

---

## Proje Yapısı

```text
.
├── index.html          # Uygulama ana sayfası
├── css/
│   └── styles.css      # Duyarlı arayüz ve uyarı/rozet stilleri
├── js/
│   ├── core.js         # Saf iş mantığı (doğrulama, filtreleme, teslim tarihi hesaplama)
│   └── app.js          # DOM etkileşimleri, filtre durumu ve arayüz güncelleme
├── tests/
│   └── core.test.js    # Node.js dahili test runner ile birim testleri
└── README.md           # Proje dokümantasyonu ve kullanım kılavuzu
```
