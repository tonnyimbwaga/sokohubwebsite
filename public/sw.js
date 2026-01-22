self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // a default icon
    badge: '/badge-72x72.png' // a default badge
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
}); 