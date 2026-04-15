import User from "./User";

class Customer extends User {
  constructor(id: number, name: string) {
    super(id, name);
  }
}

export default Customer;