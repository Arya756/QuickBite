# System Design Overview

## SDLC Model

The project follows an Agile approach, where development is done in phases with continuous improvements.

## OOP Concepts Used

Encapsulation:
Data and methods are grouped within classes like Order and User.

Inheritance:
Customer and RestaurantOwner extend the User class.

Polymorphism:
Different payment methods implement the same PaymentStrategy interface.

Abstraction:
Interfaces like PaymentStrategy and Observer define behavior without implementation.

## SOLID Principles

Single Responsibility:
Each class has a specific responsibility (Order, Payment, Repository).

Open/Closed:
New payment methods can be added without modifying existing code.

Dependency Inversion:
OrderService depends on OrderRepository interface instead of implementation.