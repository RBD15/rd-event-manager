const EventBusInterface = require("./EventBusInterface");

class EventBus extends EventBusInterface {
  #subscriptions = {};

  constructor() {
    super();
    this.getNextUniqueId = getIdGenerator();

    function getIdGenerator() {
      let lastId = 0;
      return function getNextUniqueId() {
        lastId += 1;
        return lastId;
      };
    }

    this.subscribe = (eventType, eventHandler) => {
      const id = this.getNextUniqueId();
      if (!this.#subscriptions[eventType])
        this.#subscriptions[eventType] = {};

      this.#subscriptions[eventType][id] = eventHandler;
      return {
        unsubscribe: () => {
          delete this.#subscriptions[eventType][id];
          if (Object.keys(this.#subscriptions[eventType]).length === 0)
            delete this.#subscriptions[eventType];
        }
      };
    };

    this.publish = (event) => {
      const eventType = event.getEventType();
      if (!this.#subscriptions[eventType])
        return;

      Object.keys(this.#subscriptions[eventType]).forEach((key) => {
        this.#subscriptions[eventType][key].handle(event);
      });
    };
  }
}

module.exports = EventBus