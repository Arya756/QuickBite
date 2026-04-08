import { User } from '../models/User';
import { IUserRepository } from '../interfaces/IRepositories';

export class InMemoryUserRepository implements IUserRepository {
  private _users: Map<string, User> = new Map();

  public async findById(id: string): Promise<User | null> {
    return this._users.get(id) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return Array.from(this._users.values()).find(u => u.email === email) || null;
  }

  public async findByEmailWithPassword(email: string): Promise<any> {
    return Array.from(this._users.values()).find(u => u.email === email) || null;
  }

  public async save(user: User): Promise<User> {
    this._users.set(user.id, user);
    return user;
  }
}
