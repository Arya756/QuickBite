import MenuItem from "../db/MenuItemModel";

export class MenuRepository {
    async findAll() {
        return await MenuItem.find();
    }

    async create(itemData: { name: string; price: number }) {
        return await MenuItem.create(itemData);
    }

    async deleteById(id: string) {
        return await MenuItem.findByIdAndDelete(id);
    }

    async findById(id: string) {
        return await MenuItem.findById(id);
    }
}

export default MenuRepository;