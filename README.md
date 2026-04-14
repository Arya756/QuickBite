# QuickBite
QuickBite is a scalable food ordering system built with clean layered architecture and strong OOP principles. It supports user management, restaurant & menu handling, order lifecycle tracking, flexible payment strategies, and real-time updates, demonstrating SOLID principles and core system design concepts.
## Design Patterns Used

### Strategy Pattern (Payment)

The Strategy Pattern is used to handle different payment methods such as UPI and Card. It allows the system to select a payment method at runtime without modifying the Order class.

This follows the Open/Closed Principle, as new payment methods can be added without changing existing code.

### Observer Pattern (Order Updates)

The Observer Pattern is used to notify users about order status changes. When the order status is updated, all observers are automatically notified.

This ensures loose coupling between the order system and notification system.