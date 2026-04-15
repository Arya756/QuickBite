import type Observer from "../interfaces/Observer";

class UserObserver implements Observer {
  update(order: any, message: string) {
    if (!order.notifications) {
      order.notifications = [];
    }

    order.notifications.push(message);
  }
}

export default UserObserver;   