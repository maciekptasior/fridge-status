importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Użyj tej samej konfiguracji co w głównym pliku aplikacji
firebase.initializeApp({
  apiKey: "AIzaSyCSUj5YjW9A261sHSU8PTQL0jaqWjlg16Q",
  authDomain: "fridge-status-aa96a.firebaseapp.com",
  databaseURL: "https://fridge-status-aa96a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fridge-status-aa96a",
  storageBucket: "fridge-status-aa96a.firebasestorage.app",
  messagingSenderId: "417870352083",
  appId: "1:417870352083:web:2bfed85ca7f944de030e26"
});

const messaging = firebase.messaging();

// Obsługa wiadomości przychodzących w tle (gdy przeglądarka/PWA jest zamknięta)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Otrzymano wiadomość w tle:', payload);

  const notificationTitle = payload.notification.title || 'Domowa Spiżarnia';
  const notificationOptions = {
    body: payload.notification.body || 'Kończą się produkty w spiżarni!',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
