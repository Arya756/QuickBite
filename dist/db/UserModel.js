"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // Password will not be returned in find queries by default
    },
    role: {
        type: String,
        enum: ["CUSTOMER", "ADMIN"],
        default: "CUSTOMER"
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("User", UserSchema);
