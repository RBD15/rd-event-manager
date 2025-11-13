const EventBus = require("./EventBus");

class EventManager {
  #eventBus;

  constructor() {
    this.#eventBus = new EventBus();

    this.subscribe = (eventType, eventHandler) => {
      this.#eventBus.subscribe(eventType, eventHandler);
    };

    this.emit = (event) => {
      this.#eventBus.publish(event);
    };
  }
}

const eventManager = new EventManager();
module.exports = eventManager