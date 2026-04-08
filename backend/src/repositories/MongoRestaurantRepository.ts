import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { IRestaurantRepository } from '../interfaces/IRepositories';
import { RestaurantModel, IRestaurantDocument } from '../database/schemas/RestaurantSchema';

export class MongoRestaurantRepository implements IRestaurantRepository {
  
  private mapToDomain(doc: IRestaurantDocument): Restaurant {
    const restaurant = new Restaurant(doc._id.toString(), doc.name, doc.address, doc.ownerId);
    restaurant.isOpen = doc.isOpen;
    doc.menu.forEach(item => {
      restaurant.addMenuItem(new MenuItem(item.id, item.name, item.description, item.price, item.imageUrl));
    });
    return restaurant;
  }

  public async findById(id: string): Promise<Restaurant | null> {
    const doc = await RestaurantModel.findById(id);
    return doc ? this.mapToDomain(doc) : null;
  }

  public async findAll(): Promise<Restaurant[]> {
    const docs = await RestaurantModel.find();
    return docs.map(doc => this.mapToDomain(doc));
  }

  public async search(query: string): Promise<Restaurant[]> {
    const regex = new RegExp(query, 'i');
    const docs = await RestaurantModel.find({
      $or: [
        { name: regex },
        { address: regex },
        { 'menu.name': regex },
        { 'menu.description': regex }
      ]
    });
    return docs.map(doc => this.mapToDomain(doc));
  }

  public async save(restaurant: Restaurant): Promise<Restaurant> {
    const data = {
      name: restaurant.name,
      address: restaurant.address,
      ownerId: restaurant.ownerId,
      isOpen: restaurant.isOpen,
      menu: restaurant.menu.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable
      }))
    };

    let doc;
    if (restaurant.id && restaurant.id.length === 24) { // Check if it's a valid ObjectId string
        doc = await RestaurantModel.findByIdAndUpdate(restaurant.id, data, { new: true, upsert: true });
    } else {
        doc = await RestaurantModel.create(data);
    }
    
    return this.mapToDomain(doc);
  }
}
