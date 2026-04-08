import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/IRepositories';
import { User } from '../models/User';
import { Customer, Admin, RestaurantOwner } from '../models/UserSpecializations';

export class AuthService {
  private _userRepository: IUserRepository;
  private _jwtSecret: string;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
    this._jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  }

  public async register(userData: any): Promise<{ user: User, token: string }> {
    const existingUser = await this._userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    let user;
    const { email, firstName, lastName, role } = userData;
    const id = ''; // Repository will generate ID

    switch (role) {
      case 'ADMIN':
        user = new Admin(id, email, firstName, lastName);
        break;
      case 'RESTAURANT_OWNER':
        user = new RestaurantOwner(id, email, firstName, lastName);
        break;
      case 'CUSTOMER':
      default:
        user = new Customer(id, email, firstName, lastName, userData.address || '', userData.phoneNumber || '');
    }

    // Pass password to save (MongoUserRepository handles it now)
    const savedUser = await this._userRepository.save({ ...user, password: hashedPassword } as any);
    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  public async login(email: string, password: string): Promise<{ user: User, token: string }> {
    const userDoc = await this._userRepository.findByEmailWithPassword(email);
    if (!userDoc) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Convert doc to domain
    const names = userDoc.name.split(' ');
    const user = new Customer(userDoc._id.toString(), userDoc.email, names[0] || '', names.slice(1).join(' ') || '', '', '');

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this._jwtSecret,
      { expiresIn: '7d' }
    );
  }
}
