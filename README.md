# Event Manager

## Description:
A Basic EventManager singleton and EventBus class to subscribe Listener and emit events

## version:
### 1.0
1. EventManager singleton class
2. EventManager Emit and subscribe methods
3. EventBus class with subscribe and private getIdGenerator method

### 1.1.0
1. Fix EventBus subscribes handler execution (fire-and-forget)
2. Add a new EventBusInterface to allow switch between an EventBus in memory or a KafkaImplementation 
## EventBus Interface and Kafka adapter

- **EventBusInterface**: A runtime abstract class in `src/EventBusInterface.js` that documents the expected API for EventBus implementations. Methods: `subscribe(eventType, eventHandler)`, `publish(event)`, optional `connect()` and `disconnect()` for async implementations.

- **In-memory EventBus**: `src/EventBus.js` implements the interface and remains the default used by the `EventManager` singleton.

3. KafkaEventBus implementation:
   1. KafkaEventBus is an adapter that uses `kafkajs` (optional dependency). To use it:
   2. Steps:
      1. Install `kafkajs`: 

   	  ```powershell
   	  npm install kafkajs
   	  ```
     2. Create and inject the Kafka bus:

   	  ```javascript
   	  const KafkaEventBus = require('./src/KafkaEventBus');
   	  const EventManagerClass = require('./src/EventManager');

   	  const kafkaBus = new KafkaEventBus({ brokers: ['localhost:9092'] });
   	  const manager = new EventManagerClass(kafkaBus);
   	  // or modify the exported singleton if desired
   	  ```

  Notes:
  - `KafkaEventBus.publish` is async and returns the producer send Promise.
  - `KafkaEventBus.subscribe` starts a consumer and calls `eventHandler.handle(event)` for incoming messages.
  - The current adapter is a starter implementation; for production you should refine consumer group/topic management and error handling.
