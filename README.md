# Web Push Notification MVP Backend

Production-oriented MVP backend for Web Push campaigns using NestJS, MongoDB, BullMQ, Redis, and Web Push (VAPID).

## Stack

- NestJS modular architecture
- MongoDB with Mongoose
- BullMQ with Redis
- Web Push with VAPID
- Swagger
- Docker and Docker Compose

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://mongo:27017/push-mvp
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
QUEUE_CONCURRENCY=10
SWAGGER_PATH=docs
API_BASE_URL=http://localhost:3000
VAPID_SUBJECT=mailto:admin@example.com
VAPID_PUBLIC_KEY=your_public_vapid_key
VAPID_PRIVATE_KEY=your_private_vapid_key
```

Generate VAPID keys:

```bash
npm run vapid:generate
```

## Local Run

```bash
npm install
npm run start:dev
```

Swagger:

```text
http://localhost:3000/docs
```

Service worker:

```text
http://localhost:3000/service-worker.js
```

HTML demo page:

```text
http://localhost:3000/
```

## Docker Run

```bash
docker compose up --build
```

The stack starts:

- API on `http://localhost:3000`
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

## HTML Demo Page

The project includes a static demo page at [public/index.html](/Users/macos/Desktop/projects/push-test-task/push-test-task/public/index.html). It is served by NestJS from the application root:

```text
http://localhost:3000/
```

For remote browser testing, open the same page through your `ngrok` URL:

```text
https://your-ngrok-domain/
```

Example:

```text
https://polysemous-delmy-monohydroxy.ngrok-free.dev
```

### What the page does

- Registers `service-worker.js`
- Requests browser notification permission
- Fetches the public VAPID key from `GET /subscriptions/public-key`
- Creates a browser `PushSubscription`
- Saves the subscription through `POST /subscriptions`
- Creates a campaign through `POST /campaigns`
- Polls `GET /campaigns/:id` to refresh `status`, `sentCount`, and `failedCount`

### Demo flow

1. Open `/` in the browser.
2. Click `Register Service Worker`.
3. Allow notifications in the browser.
4. Click `Create Push Subscription`.
5. Click `Save Subscription`.
6. Enter a campaign title and message.
7. Click `Create Campaign`.
8. Wait for the `Latest Campaign Response` block to move from `pending` to `completed` or `failed`.

### Demo page notes

- Open the page through the same origin you use for push testing.
- If the `ngrok` domain changes, create and save the subscription again.
- `Current Subscription` shows the browser subscription object before or after saving it to MongoDB.
- `Latest Campaign Response` shows the persisted campaign state from MongoDB, not just the initial `POST /campaigns` response.

## API Overview

### Create subscription

`POST /subscriptions`

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/abc123",
  "keys": {
    "p256dh": "base64-encoded-key",
    "auth": "base64-encoded-auth"
  }
}
```

### Get public VAPID key

`GET /subscriptions/public-key`

### Create campaign

`POST /campaigns`

```json
{
  "title": "Weekly digest",
  "message": "Your weekly update is ready."
}
```

Creating a campaign only persists data and enqueues an async delivery job. The controller never sends push notifications directly.

### Track event

`POST /events`

```json
{
  "type": "click",
  "campaignId": "65f6b6f0a44308fef7dd1f77",
  "subscriptionEndpoint": "https://fcm.googleapis.com/fcm/send/abc123"
}
```

Accepted event types:

- `received`
- `click`
- `close`

## Delivery Flow

1. Client subscribes with the Push API and calls `POST /subscriptions`.
2. Server stores the subscription if it does not already exist.
3. `POST /campaigns` creates a campaign and enqueues a `send-campaign` BullMQ job.
4. The worker loads all subscriptions and sends Web Push notifications asynchronously.
5. Invalid subscriptions are removed automatically on `404` or `410`.
6. Client-side service worker posts engagement events back to `POST /events`.

## Useful Commands

```bash
npm run lint
npm run test
npm run build
```
