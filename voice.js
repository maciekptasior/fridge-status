// voice.js

// Lista słów łączących / szumu, które mają być ignorowane przy dzieleniu wypowiedzi
const STOP_WORDS = [
  'trzeba', 'kupić', 'dodaj', 'do', 'listy', 'poproszę', 'muszę', 'kup',
  'i', 'oraz', 'także', 'również', 'może', 'jeszcze', 'oraz', 'tylko'
];

// Słownik do podstawowego dopasowywania kategorii
function detectCategoryByName(name) {
  const lower = name.toLowerCase();
  if (lower.includes('mleko') || lower.includes('ser') || lower.includes('jogurt') || lower.includes('masło')) return 'Nabiał';
  if (lower.includes('chleb') || lower.includes('bułka') || lower.includes('drożdżówka')) return 'Pieczywo';
  if (lower.includes('szynka') || lower.includes('mięso') || lower.includes('kiełbasa') || lower.includes('kurczak')) return 'Mięso';
  if (lower.includes('jabłko') || lower.includes('pomidor') || lower.includes('ogórek') || lower.includes('banan')) return 'Warzywa i Owoce';
  if (lower.includes('olej') || lower.includes('mąka') || lower.includes('cukier') || lower.includes('płatki') || lower.includes('makaron')) return 'Spiżarnia / Suche';
  return 'Inne';
}

// Analiza tekstu i wyodrębnienie poszczególnych produktów
export function parseVoiceInput(text) {
  if (!text) return [];

  // Zamiana na małe litery i usunięcie interpunkcji
  let cleaned = text.toLowerCase().replace(/[,.?!]/g, ' ');

  // Podział na słowa
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  // Filtrowanie słów kluczowych (np. "trzeba kupić")
  const filteredWords = words.filter(w => !STOP_WORDS.includes(w));

  // Zwrócenie Unikalnych produktów
  return [...new Set(filteredWords)].map(item => {
    // Pierwsza litera wielka
    const formattedName = item.charAt(0).toUpperCase() + item.slice(1);
    return {
      name: formattedName,
      category: detectCategoryByName(formattedName)
    };
  });
}

// Główna funkcja nagrywania głosu
export function startVoiceRecognition(onItemsDetected) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome lub Safari.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pl-PL';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const btn = document.getElementById('voice-toggle-btn');
  if (btn) btn.textContent = '🎙️ Słucham... Powiedz produkty';

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Rozpoznany tekst:", transcript);

    const detectedProducts = parseVoiceInput(transcript);

    if (detectedProducts.length > 0) {
      onItemsDetected(detectedProducts);
    } else {
      alert("Nie rozpoznano żadnych produktów. Spróbuj powiedzieć np. 'Mleko, płatki, olej'.");
    }
  };

  recognition.onerror = (event) => {
    console.error("Błąd rozpoznawania mowy:", event.error);
    alert("Błąd rozpoznawania głosu: " + event.error);
  };

  recognition.onend = () => {
    if (btn) btn.textContent = '🎤 Dodaj głosowo';
  };
}
