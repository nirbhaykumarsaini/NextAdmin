import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHowToPlay extends Document {
    howtoplay_title: string;
    howtoplay_message: string;
    video_id: string;
}

const howToPlaySchema: Schema = new Schema(
    {
        howtoplay_title: {
            type: String,
            required: [true, "howtoplay_title is required"]
        },
        howtoplay_message: {
            type: String,
            required: [true, "howtoplay_message is required"]
        },
        video_id: {
            type: String,
            required: [true, "video_id is required"]
        }
    },
    { timestamps: true }
);

const HowToPlay: Model<IHowToPlay> = mongoose.models.HowToPlay || mongoose.model<IHowToPlay>('HowToPlay', howToPlaySchema);

export default HowToPlay;