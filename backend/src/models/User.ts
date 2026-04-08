import { UserRole } from '../interfaces/enums';

export abstract class User {
  private _id: string;
  private _email: string;
  private _firstName: string;
  private _lastName: string;
  private _role: UserRole;

  constructor(id: string, email: string, firstName: string, lastName: string, role: UserRole) {
    this._id = id;
    this._email = email;
    this._firstName = firstName;
    this._lastName = lastName;
    this._role = role;
  }

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public set email(value: string) {
    // Validation could go here
    this._email = value;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public set firstName(value: string) {
    this._firstName = value;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public set lastName(value: string) {
    this._lastName = value;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
}
