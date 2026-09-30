// scanner.js

let html5QrcodeScanner = null;

// Mapowanie kategorii z Open Food Facts na kategorie w aplikacji Domowa Spiżarnia
function mapCategory(offCategories) {
  if (!offCategories) return 'Inne';
  const cats = offCategories.toLowerCase();

  if (cats.includes('dairies') || cats.includes('milk') || cats.includes('cheese') || cats.includes('yogurt') || cats.includes('nabiał')) return 'Nabiał';
  if (cats.includes('bread') || cats.includes('bakery') || cats.includes('pieczywo')) return 'Pieczywo';
  if (cats.includes('meats') || cats.includes('poultry') || cats.includes('sausages') || cats.includes('mięso')) return 'Mięso';
  if (cats.includes('fruits') || cats.includes('vegetables') || cats.includes('owoce') || cats.includes('warzywa')) return 'Warzywa i Owoce';
  if (cats.includes('groceries') || cats.includes('cereal') || cats.includes('pasta') || cats.includes('canned') || cats.includes('suche')) return 'Spiżarnia / Suche';
  
  return 'Inne';
}

// Pobieranie danych o produkcie ze sklepu po kodzie EAN/UPC
async function fetchProductFromOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_pl,categories_tags`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = p.product_name_pl || p.product_name || barcode;
      const category = mapCategory(p.categories_tags ? p.categories_tags.join(' ') : '');

      return { name, category };
    }
  } catch (err) {
    console.error("Błąd pobierania danych z Open Food Facts:", err);
  }
  return { name: barcode, category: 'Inne' };
}

// Funkcja wywoływana po udanym przeskanowaniu kodu
async function onScanSuccess(barcode) {
  if (navigator.vibrate) navigator.vibrate(100);

  // Wyłączenie kamery
  toggleScanner();

  const nameInput = document.getElementById('item-name');
  nameInput.value = "Szukam w bazie...";

  // Pobranie danych ze sklepu
  const productData = await fetchProductFromOpenFoodFacts(barcode);

  nameInput.value = productData.name;
  document.getElementById('item-category').value = productData.category;
}

// Główna funkcja włączająca / wyłączająca skaner
export function toggleScanner() {
  const readerDiv = document.getElementById('reader');
  const scanBtn = document.getElementById('scan-toggle-btn');

  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner = null;
      readerDiv.style.display = 'none';
      scanBtn.textContent = '📷 Skanuj kod kreskowy';
    }).catch(err => console.error("Błąd zatrzymania skanera:", err));
  } else {
    readerDiv.style.display = 'block';
    scanBtn.textContent = '⏳ Ładowanie kamery...';

    html5QrcodeScanner = new Html5Qrcode("reader");
    
    const config = { 
      fps: 10, 
      qrbox: { width: 260, height: 140 },
      formatsToSupport: [ 
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128
      ]
    };

    html5QrcodeScanner.start(
      { facingMode: "environment" },
      config,
      onScanSuccess
    ).then(() => {
      scanBtn.textContent = '❌ Zamknij aparat';
    }).catch(err => {
      alert("Nie udało się uzyskać dostępu do kamery.");
      console.error(err);
      toggleScanner();
    });
  }
}
