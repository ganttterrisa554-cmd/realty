// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  key: string; // 4-digit unique code like "2381"
  referralLink: string;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    key: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}$/, // ensures exactly 4 digits
    },

    referralLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Automatically generate referralLink before saving
UserSchema.pre<IUser>("save", function (next) {
  if (!this.referralLink && this.key) {
    this.referralLink = `https://invitationhomesrental.com/register?ref=${this.key}`;
  }
  next();
});

export default mongoose.models.User2 ||
  mongoose.model<IUser>("User2", UserSchema);
