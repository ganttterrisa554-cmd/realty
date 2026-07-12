// models/EmailList.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEmailList extends Document {
    emails: string[];
}

const EmailListSchema = new Schema<IEmailList>(
    {
        emails: [{ type: String, unique: true }],
    },
    { timestamps: true }
);

export default (mongoose.models && mongoose.models.EmailListt) ||
    mongoose.model<IEmailList>("EmailListt", EmailListSchema);
