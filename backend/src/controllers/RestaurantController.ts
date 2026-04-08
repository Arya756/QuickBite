import { Request, Response } from 'express';
import { RestaurantService } from '../services/RestaurantService';

export class RestaurantController {
  private _restaurantService: RestaurantService;

  constructor(restaurantService: RestaurantService) {
    this._restaurantService = restaurantService;
  }

  public async getRestaurants(req: Request, res: Response): Promise<void> {
    const searchQuery = req.query.search as string;
    let restaurants;
    if (searchQuery) {
      restaurants = await this._restaurantService.searchRestaurants(searchQuery);
    } else {
      restaurants = await this._restaurantService.getRestaurants();
    }
    res.status(200).json(restaurants);
  }

  public async getRestaurantById(req: Request, res: Response): Promise<void> {
    try {
      const restaurant = await this._restaurantService.getRestaurantById(req.params.id as string);
      res.status(200).json(restaurant);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
