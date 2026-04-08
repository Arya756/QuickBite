import { IRestaurantRepository } from '../interfaces/IRepositories';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';

export class RestaurantService {
  private _restaurantRepository: IRestaurantRepository;

  constructor(restaurantRepository: IRestaurantRepository) {
    this._restaurantRepository = restaurantRepository;
  }

  public async getRestaurants(): Promise<Restaurant[]> {
    return await this._restaurantRepository.findAll();
  }

  public async searchRestaurants(query: string): Promise<Restaurant[]> {
    return await this._restaurantRepository.search(query);
  }

  public async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this._restaurantRepository.findById(id);
    if (!restaurant) throw new Error("Restaurant not found");
    return restaurant;
  }

  public async addMenuItem(restaurantId: string, item: MenuItem): Promise<Restaurant> {
    const restaurant = await this.getRestaurantById(restaurantId);
    restaurant.addMenuItem(item);
    return await this._restaurantRepository.save(restaurant);
  }
}
