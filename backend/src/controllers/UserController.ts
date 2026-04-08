import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';

export class UserController {
  private _userService: UserService;
  private _authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this._userService = userService;
    this._authService = authService;
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this._userService.getUserById(req.params.id as string);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this._authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  public async getProfile(req: any, res: Response): Promise<void> {
    try {
      const user = await this._userService.getUserById(req.user.userId);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
