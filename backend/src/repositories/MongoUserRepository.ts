import { User } from '../models/User';
import { Customer, Admin, RestaurantOwner } from '../models/UserSpecializations';
import { IUserRepository } from '../interfaces/IRepositories';
import { UserModel, IUserDocument } from '../database/schemas/UserSchema';
import { UserRole } from '../interfaces/enums';

export class MongoUserRepository implements IUserRepository {
  
  private mapToDomain(doc: IUserDocument): User {
    const names = doc.name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    switch (doc.role) {
      case 'ADMIN':
        return new Admin(doc._id.toString(), doc.email, firstName, lastName);
      case 'RESTAURANT_OWNER':
        return new RestaurantOwner(doc._id.toString(), doc.email, firstName, lastName);
      case 'CUSTOMER':
      default:
        return new Customer(doc._id.toString(), doc.email, firstName, lastName, '', '');
    }
  }

  public async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.mapToDomain(doc) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? this.mapToDomain(doc) : null;
  }

  public async findByEmailWithPassword(email: string): Promise<any> {
    return await UserModel.findOne({ email }).select('+password');
  }

  public async save(user: User & { password?: string }): Promise<User> {
    const data: any = {
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    if (user.password) {
      data.password = user.password;
    }

    let doc;
    if (user.id && user.id.length === 24) {
      doc = await UserModel.findByIdAndUpdate(user.id, data, { new: true, upsert: true });
    } else {
      doc = await UserModel.create(data);
    }

    return this.mapToDomain(doc);
  }
}
