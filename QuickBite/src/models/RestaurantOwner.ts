import User from "./User";

class RestaurantOwner extends User {
  constructor(id: number, name: string) {
    super(id, name);
  }
}

export default RestaurantOwner;