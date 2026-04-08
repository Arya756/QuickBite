import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RestaurantController } from '../controllers/RestaurantController';
import { OrderController } from '../controllers/OrderController';
import { PaymentController } from '../controllers/PaymentController';

// Services
import { UserService } from '../services/UserService';
import { RestaurantService } from '../services/RestaurantService';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';
import { AuthService } from '../services/AuthService';

// Repositories
import { MongoUserRepository } from '../repositories/MongoUserRepository';
import { MongoRestaurantRepository } from '../repositories/MongoRestaurantRepository';
import { MongoOrderRepository } from '../repositories/MongoOrderRepository';
import { MongoPaymentRepository } from '../repositories/MongoPaymentRepository';

// Middleware
import { authMiddleware, authorize } from '../utils/AuthMiddleware';
import { UserRole } from '../interfaces/enums';

// Payment Strategies
import { CashOnDelivery } from '../services/payment/strategies/PaymentStrategies';

const router = Router();

// Initialization
const userRepo = new MongoUserRepository();
const userService = new UserService(userRepo);
const authService = new AuthService(userRepo);
const userController = new UserController(userService, authService);

const restaurantRepo = new MongoRestaurantRepository();
const restaurantService = new RestaurantService(restaurantRepo);
const restaurantController = new RestaurantController(restaurantService);

const orderRepo = new MongoOrderRepository();
const orderService = new OrderService(orderRepo);
const orderController = new OrderController(orderService);

const paymentRepo = new MongoPaymentRepository();
const paymentService = new PaymentService(paymentRepo, new CashOnDelivery());
const paymentController = new PaymentController(paymentService);

// --- Public Routes ---
router.post('/users/register', (req, res) => userController.register(req, res));
router.post('/users/login', (req, res) => userController.login(req, res));
router.get('/restaurants', (req, res) => restaurantController.getRestaurants(req, res));
router.get('/restaurants/:id', (req, res) => restaurantController.getRestaurantById(req, res));

// --- Protected Routes (Authenticated) ---
router.use(authMiddleware);

router.get('/users/profile', (req, res) => userController.getProfile(req, res));
router.post('/orders', (req, res) => orderController.createOrder(req, res));
router.get('/orders/:id', (req, res) => orderController.getOrder(req, res));
router.post('/payments/process', (req, res) => paymentController.processPayment(req, res));

// --- Manager Routes (Restaurant Owner / Admin) ---
router.patch('/orders/status', authorize([UserRole.RESTAURANT_OWNER, UserRole.ADMIN]), (req, res) => orderController.updateStatus(req, res));

export default router;
