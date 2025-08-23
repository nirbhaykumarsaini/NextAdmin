import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContactInfo extends Document {
    mobile_number: string;
    whatshapp_number: string;
    website_link: string;
    telegram_channel: string;
    email: string;
}

const contactInfoSchema: Schema = new Schema(
    {
        mobile_number: {
            type: String,
            required:false
        },
        whatshapp_number: {
            type: String,
            required:false
        },
        website_link: {
            type: String,
            required: false
        },
        telegram_channel: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        }

    },
);

const ContactInfo: Model<IContactInfo> = mongoose.models.ContactInfo || mongoose.model<IContactInfo>('ContactInfo', contactInfoSchema);

export default ContactInfo;