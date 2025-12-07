const EventBusInterface = require("./EventBusInterface");

let { Kafka } = {};
try {
  // optional dependency
  ({ Kafka } = require('kafkajs'));
} catch (e) {
  // kafkajs is not installed; we'll surface this when used
}

/**
 * Kafka-backed EventBus adapter.
 *
 * Constructor opts:
 * - brokers: array of broker addresses (required)
 * - clientId: string
 * - groupId: string (consumer group for subscriptions)
 * - topicPrefix: optional prefix for topics
 */
class KafkaEventBus extends EventBusInterface {
  constructor(opts = {}) {
    super();
    if (!Kafka) {
      throw new Error('kafkajs is not installed. Install it with `npm install kafkajs` to use KafkaEventBus.');
    }

    const { brokers, clientId = 'event-bus-client', groupId = 'event-bus-group', topicPrefix = '' } = opts;
    if (!brokers || !Array.isArray(brokers) || brokers.length === 0)
      throw new Error('KafkaEventBus requires `brokers` array in options');

    this.kafka = new Kafka({ clientId, brokers });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId });
    this.topicPrefix = topicPrefix;
    this.subscriptions = new Map();
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    await this.producer.connect();
    await this.consumer.connect();
    this.connected = true;
  }

  async disconnect() {
    if (!this.connected) return;
    await this.consumer.disconnect();
    await this.producer.disconnect();
    this.connected = false;
  }

  async publish(event) {
    if (!this.connected) await this.connect();
    const eventType = event.getEventType();
    const topic = `${this.topicPrefix}${eventType}`;
    const payload = {
      value: JSON.stringify(event)
    };
    return this.producer.send({ topic, messages: [payload] });
  }

  subscribe(eventType, eventHandler) {
    // subscribe should return an unsubscribe object synchronously to remain compatible.
    const topic = `${this.topicPrefix}${eventType}`;

    const runHandler = async () => {
      if (!this.connected) await this.connect();
      await this.consumer.subscribe({ topic, fromBeginning: false });
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const payload = message.value ? JSON.parse(message.value.toString()) : null;
            // If payload is an event-like object, pass as-is; otherwise, wrap
            const evt = payload;
            if (eventHandler && typeof eventHandler.handle === 'function') {
              eventHandler.handle(evt);
            }
          } catch (err) {
            // swallow handler errors to avoid crashing the consumer; users can log
            // In production, consider exposing an error hook.
          }
        }
      });
    };

    // start the consumer run (async) but return subscription object synchronously
    runHandler().catch(() => {});

    const subscription = {
      unsubscribe: async () => {
        // Note: kafkajs does not provide a direct per-subscription unsubscribe.
        // As a simple approach, we track logical subscriptions and if all for a
        // topic are removed we stop the consumer (disconnect) — consumer is shared.
        // For finer control, create a dedicated consumer per subscription.
        // Here we provide a best-effort placeholder.
        // This implementation does not fully remove topic subscription.
      }
    };

    // track subscriptions for future improvements
    const existing = this.subscriptions.get(topic) || new Set();
    existing.add(subscription);
    this.subscriptions.set(topic, existing);

    return subscription;
  }
}

module.exports = KafkaEventBus;
