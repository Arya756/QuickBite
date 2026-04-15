import { MenuRepository } from "../repositories/MenuRepository";

export class MenuService {
  constructor(private menuRepo: MenuRepository) {}

  async getAllItems() {
    return await this.menuRepo.findAll();
  }

  async addItem(itemData: { name: string; price: number }) {
    if (!itemData.name || !itemData.price) {
      throw new Error("Invalid menu item: name and price are required");
    }
    return await this.menuRepo.create(itemData);
  }

  async deleteItem(id: string) {
    const deletedItem = await this.menuRepo.deleteById(id);
    if (!deletedItem) {
      throw new Error("Menu item not found");
    }
    return deletedItem;
  }
}

export default MenuService;
