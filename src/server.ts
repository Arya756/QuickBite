import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "./config/db";

// import MongoOrderRepository from "./repositories/MongoOrderRepository";
// import OrderService from "./services/OrderService";
// import UserModel from "./db/UserModel";
// import MenuItem from "./db/MenuItemModel";
// import MenuRepository from "./repositories/MenuRepository";
// import MenuService from "./services/MenuService";
// import UpiPayment from "./strategies/UpiPayment";
// import CardPayment from "./strategies/CardPayment";
import { verifyToken, authorize, AuthRequest } from "./middleware/AuthMiddleware";
import { Request, Response } from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// const repo = new MongoOrderRepository();
// const service = new OrderService(repo);

// const menuRepo = new MenuRepository();
// const menuService = new MenuService(menuRepo);

const JWT_SECRET = process.env.JWT_SECRET || 'secret_quickbite_key_2026';
