const EventBus = require("./EventBus");

class EventManager {
  #eventBus;

  //Init with provided EventBus or default in-memory EventBus

  constructor(eventBus) {
    this.#eventBus = eventBus || new EventBus();

    this.subscribe = (eventType, eventHandler) => {
      return this.#eventBus.subscribe(eventType, eventHandler);
    };

    this.emit = (event) => {
      return this.#eventBus.publish(event);
    };
  }
}

const eventManager = new EventManager();
module.exports = eventManager;