import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { IRestaurantRepository } from '../interfaces/IRepositories';

export class InMemoryRestaurantRepository implements IRestaurantRepository {
  private _restaurants: Map<string, Restaurant> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    const r1 = new Restaurant('1', 'Burger King', 'Connaught Place, Delhi', 'o1');
    r1.addMenuItem(new MenuItem('m1', 'Whopper Burger', 'Our signature flame-grilled beef burger.', 199, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'));
    r1.addMenuItem(new MenuItem('m2', 'Crispy Chicken', 'Crispy chicken patty with fresh lettuce.', 159, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'));
    
    const r2 = new Restaurant('2', 'Pizza Hut', 'Saket, Delhi', 'o2');
    r2.addMenuItem(new MenuItem('m3', 'Margherita Pizza', 'Classic cheese and tomato pizza.', 349, 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=400'));
    r2.addMenuItem(new MenuItem('m4', 'Pepperoni Pizza', 'Spicy pepperoni with extra cheese.', 499, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'));

    const r3 = new Restaurant('3', 'Subway', 'Cyber City, Gurgaon', 'o3');
    r3.addMenuItem(new MenuItem('m5', 'Paneer Tikka Sub', 'Spicy paneer tikka with mint mayo.', 229, 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400'));
    r3.addMenuItem(new MenuItem('m6', 'Veggie Delite', 'Fresh vegetables and cheese.', 189, 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400'));

    this._restaurants.set(r1.id, r1);
    this._restaurants.set(r2.id, r2);
    this._restaurants.set(r3.id, r3);
  }

  public async findById(id: string): Promise<Restaurant | null> {
    return this._restaurants.get(id) || null;
  }

  public async findAll(): Promise<Restaurant[]> {
    return Array.from(this._restaurants.values());
  }

  public async save(restaurant: Restaurant): Promise<Restaurant> {
    this._restaurants.set(restaurant.id, restaurant);
    return restaurant;
  }
}
