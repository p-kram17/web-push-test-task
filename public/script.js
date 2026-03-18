const registerButton = document.getElementById('register-btn');
const subscribeButton = document.getElementById('subscribe-btn');
const saveButton = document.getElementById('save-btn');
const campaignForm = document.getElementById('campaign-form');

const swDot = document.getElementById('sw-dot');
const swState = document.getElementById('sw-state');
const subscriptionStatus = document.getElementById('subscription-status');
const campaignStatus = document.getElementById('campaign-status');
const subscriptionJson = document.getElementById('subscription-json');
const campaignJson = document.getElementById('campaign-json');

let serviceWorkerRegistration = null;
let currentSubscription = null;
let campaignPollingId = null;

registerButton.addEventListener('click', async () => {
  try {
    ensureBrowserSupport();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('The browser did not allow notifications.');
    }

    serviceWorkerRegistration =
      await navigator.serviceWorker.register('/service-worker.js');
    await navigator.serviceWorker.ready;

    swDot.classList.add('live');
    swState.textContent = 'Service Worker registered';
    subscribeButton.disabled = false;

    setStatus(
      subscriptionStatus,
      'Service Worker successfully registered. You can now create a push subscription.',
      'success',
    );
  } catch (error) {
    setStatus(subscriptionStatus, getErrorMessage(error), 'error');
  }
});

subscribeButton.addEventListener('click', async () => {
  try {
    ensureBrowserSupport();

    if (!serviceWorkerRegistration) {
      throw new Error('Please register the Service Worker first.');
    }

    const response = await fetch('/subscriptions/public-key', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch VAPID public key.');
    }

    const payload = await parseResponse(response);
    const { publicKey } = payload;

    currentSubscription = await serviceWorkerRegistration.pushManager.subscribe(
      {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      },
    );

    subscriptionJson.textContent = JSON.stringify(
      currentSubscription.toJSON(),
      null,
      2,
    );
    saveButton.disabled = false;

    setStatus(
      subscriptionStatus,
      'Push subscription created locally. You still need to save it on the backend.',
      'success',
    );
  } catch (error) {
    setStatus(subscriptionStatus, getErrorMessage(error), 'error');
  }
});

saveButton.addEventListener('click', async () => {
  try {
    if (!currentSubscription) {
      throw new Error('No local subscription to save.');
    }

    const response = await fetch('/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(currentSubscription.toJSON()),
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new Error(JSON.stringify(payload, null, 2));
    }

    subscriptionJson.textContent = JSON.stringify(payload, null, 2);
    setStatus(
      subscriptionStatus,
      'Subscription saved to MongoDB. You can now create a campaign.',
      'success',
    );
  } catch (error) {
    setStatus(subscriptionStatus, getErrorMessage(error), 'error');
  }
});

campaignForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const title = document.getElementById('campaign-title').value.trim();
    const message = document.getElementById('campaign-message').value.trim();

    if (!title || !message) {
      throw new Error('Title and message are required.');
    }

    const response = await fetch('/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ title, message }),
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new Error(JSON.stringify(payload, null, 2));
    }

    campaignJson.textContent = JSON.stringify(payload, null, 2);
    startCampaignPolling(payload._id);
    setStatus(
      campaignStatus,
      'Campaign created. Polling started to refresh status, sentCount, and failedCount.',
      'success',
    );
  } catch (error) {
    setStatus(campaignStatus, getErrorMessage(error), 'error');
  }
});

function ensureBrowserSupport() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('This browser does not support Service Worker.');
  }

  if (!('PushManager' in window)) {
    throw new Error('This browser does not support the Push API.');
  }
}

async function parseResponse(response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!text) {
    return null;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text);
  }

  return {
    status: response.status,
    contentType,
    raw: text.slice(0, 500),
  };
}

function startCampaignPolling(campaignId) {
  stopCampaignPolling();
  void refreshCampaign(campaignId);

  campaignPollingId = window.setInterval(async () => {
    await refreshCampaign(campaignId);
  }, 1500);
}

function stopCampaignPolling() {
  if (campaignPollingId) {
    window.clearInterval(campaignPollingId);
    campaignPollingId = null;
  }
}

async function refreshCampaign(campaignId) {
  const response = await fetch(`/campaigns/${campaignId}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(JSON.stringify(payload, null, 2));
  }

  campaignJson.textContent = JSON.stringify(payload, null, 2);

  if (payload.status === 'completed' || payload.status === 'failed') {
    stopCampaignPolling();
    setStatus(
      campaignStatus,
      `Campaign ${payload.status}. Sent: ${payload.sentCount}, failed: ${payload.failedCount}.`,
      payload.status === 'completed' ? 'success' : 'error',
    );
  }
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = 'status';
  if (type) element.classList.add(type);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
