import { IUserRepository } from '../interfaces/IRepositories';
import { User } from '../models/User';

export class UserService {
  private _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  public async registerUser(user: User): Promise<User> {
    const existing = await this._userRepository.findByEmail(user.email);
    if (existing) throw new Error("Email already in use");
    return await this._userRepository.save(user);
  }
}
