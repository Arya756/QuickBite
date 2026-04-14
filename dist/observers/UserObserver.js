"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserObserver {
    update(order, message) {
        if (!order.notifications) {
            order.notifications = [];
        }
        order.notifications.push(message);
    }
}
exports.default = UserObserver;
