"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
class MenuService {
    constructor(menuRepo) {
        this.menuRepo = menuRepo;
    }
    async getAllItems() {
        return await this.menuRepo.findAll();
    }
    async addItem(itemData) {
        if (!itemData.name || !itemData.price) {
            throw new Error("Invalid menu item: name and price are required");
        }
        return await this.menuRepo.create(itemData);
    }
    async deleteItem(id) {
        const deletedItem = await this.menuRepo.deleteById(id);
        if (!deletedItem) {
            throw new Error("Menu item not found");
        }
        return deletedItem;
    }
}
exports.MenuService = MenuService;
exports.default = MenuService;
