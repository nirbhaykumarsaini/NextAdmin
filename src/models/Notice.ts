import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotice extends Document {
    notice_message: string;
    notice_title: string;
}

const noticeSchema: Schema = new Schema(
    {
        notice_title: {
            type: String,
            required: [true, "notice_title is required"]
        },
        notice_message: {
            type: String,
            required: [true, "notice_message is required"]
        }
    },{
        timestamps:true
    }
);

const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;