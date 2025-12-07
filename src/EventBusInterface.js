/*
  EventBusInterface

  This file defines the expected interface for EventBus implementations
  so alternate implementations (e.g. Kafka-backed) remain compatible with
  the current in-memory `EventBus`.

  Methods expected:
  - subscribe(eventType, eventHandler) => subscription
      * `eventType` (string)
      * `eventHandler` (object) with a `handle(event)` method
      * returns an object with `unsubscribe()` method

  - publish(event)
      * `event` (object) with `getEventType()` method
      * may return a Promise (implementations that are async can return a Promise)

  Optional lifecycle hooks for async implementations:
  - connect() : Promise
  - disconnect() : Promise

  Note: This is a runtime 'interface' (abstract base class) usable from plain JS.
*/

class EventBusInterface {
  subscribe(/* eventType, eventHandler */) {
    throw new Error('subscribe(eventType, eventHandler) not implemented');
  }

  publish(/* event */) {
    throw new Error('publish(event) not implemented');
  }

  // Optional for async-backed buses (e.g. Kafka)
  async connect() {
    // noop default: synchronous in-memory bus does not require connection
    return Promise.resolve();
  }

  async disconnect() {
    return Promise.resolve();
  }
}

module.exports = EventBusInterface;
