import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types/user.types.js';
import { hashPassword, comparePassword } from '../utils/crypto.util.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    profileImage: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const id = ret._id.toString();
        const omitKeys = ['_id', '__v', 'password', 'emailVerificationToken', 'emailVerificationExpires', 'passwordResetToken', 'passwordResetExpires'];
        const cleaned = Object.fromEntries(Object.entries(ret).filter(([k]) => !omitKeys.includes(k)));
        return { id, ...cleaned };
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await hashPassword(this.password);
    next();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
