"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuRepository = void 0;
const MenuItemModel_1 = __importDefault(require("../db/MenuItemModel"));
class MenuRepository {
    async findAll() {
        return await MenuItemModel_1.default.find();
    }
    async create(itemData) {
        return await MenuItemModel_1.default.create(itemData);
    }
    async deleteById(id) {
        return await MenuItemModel_1.default.findByIdAndDelete(id);
    }
    async findById(id) {
        return await MenuItemModel_1.default.findById(id);
    }
}
exports.MenuRepository = MenuRepository;
exports.default = MenuRepository;
