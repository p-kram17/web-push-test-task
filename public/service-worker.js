self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || 'Notification';
  const options = {
    body: payload.body || '',
    data: {
      campaignId: payload.campaignId,
      apiBaseUrl: payload.apiBaseUrl || self.location.origin,
    },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      trackEvent('received', options.data),
    ]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    Promise.all([
      trackEvent('click', event.notification.data || {}),
      clients.openWindow('/'),
    ]),
  );
});

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(trackEvent('close', event.notification.data || {}));
});

async function trackEvent(type, data) {
  const subscription = await self.registration.pushManager.getSubscription();

  if (!data.campaignId || !subscription) {
    return;
  }

  await fetch(`${data.apiBaseUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      campaignId: data.campaignId,
      subscriptionEndpoint: subscription.endpoint,
    }),
  });
}
