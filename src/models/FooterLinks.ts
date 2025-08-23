import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFooterLinks extends Document {
    footer_name: string;
    footer_link: string;
    is_active:boolean;
}

const footerLinksSchema: Schema = new Schema(
    {
        footer_name: {
            type: String,
            required: [true, "footer_name is required"]
        },
        footer_link: {
            type: String,
            required: [true, "footer_link is required"]
        },
         is_active: {
            type: Boolean,
            default:false
        }
    },
);

const FooterLinks: Model<IFooterLinks> = mongoose.models.FooterLinks || mongoose.model<IFooterLinks>('FooterLinks', footerLinksSchema);

export default FooterLinks;