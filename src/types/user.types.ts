import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDTO {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IUpdateProfileInput {
  name?: string;
  email?: string;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
