declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: import('./user.types.js').IUser;
      userId?: string;
    }
  }
}

export {};
