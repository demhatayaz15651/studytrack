# StudyTrack — Öğrenci Ödev ve Sınav Takip Uygulaması

## Proje Tanımı

**Çözdüğü Problem:** Üniversite öğrencileri dönem boyunca birden fazla derse ait ödev, proje ve sınav teslim tarihlerini farklı platformlarda (e-posta, ders sistemi, not defteri) takip etmeye çalışırken son teslim tarihlerini gözden kaçırabilmektedir. **StudyTrack**, öğrencilerin tüm ders görevlerini tek bir sade arayüzde toplamasına, tamamlama durumlarını izlemesine ve yaklaşan/geciken teslim tarihleri için anlık görsel uyarılar almasına olanak tanır.

**Hedef Kitle:** Ders yükünü, ödevlerini ve sınav takvimini kurulum gerektirmeyen hafif bir araçla düzenli biçimde takip etmek isteyen üniversite ve lise öğrencileri.

---

## İş Takip Panosu (GitHub Projects)

- **Pano Bağlantısı:** *(GitHub Projects oluşturulduktan sonra buraya eklenecektir)*
- **Sütunlar:** `Yapılacak` · `Devam Ediyor` · `Tamamlandı`

---

## Teknoloji Yığını

- **HTML5 / CSS3 / Vanilla JavaScript** (harici kütüphane veya derleme adımı gerektirmez)
- **LocalStorage** (tarayıcı tabanlı kalıcı veri saklama)
- **Node.js Built-in Test Runner (`node --test`)** (isteğe bağlı birim testleri için)

---

## Projeyi Çalıştırma Adımları

Bu proje kurulum gerektirmez; iki farklı yöntemden biriyle doğrudan çalıştırabilirsiniz:

### Yöntem 1: Doğrudan Tarayıcıda Açma (En Hızlı)
1. Depoyu bilgisayarınıza klonlayın veya ZIP olarak indirin:
   ```bash
   git clone <GITHUB_DEPO_URL>
   cd <DEPO_KLASORU>
   ```
2. Proje klasöründeki `index.html` dosyasına çift tıklayarak herhangi bir modern tarayıcıda (Chrome, Edge, Firefox) açın.

### Yöntem 2: Yerel HTTP Sunucusu ile Çalıştırma (İsteğe Bağlı)
Proje klasöründe Python veya Node.js ile basit bir yerel sunucu başlatabilirsiniz:
```bash
python -m http.server 8000
```
Ardından tarayıcıda `http://localhost:8000` adresini açın.

---

## Proje Yapısı

```text
.
├── index.html          # Uygulama ana sayfası
├── css/
│   └── styles.css      # Modern ve duyarlı arayüz stilleri
├── js/
│   ├── core.js         # Saf iş mantığı (doğrulama, filtreleme, tarih hesaplama)
│   └── app.js          # Arayüz (DOM) ve etkileşim yönetimi
├── tests/
│   └── core.test.js    # İş mantığı doğrulama testleri
└── README.md           # Proje dokümantasyonu
```
