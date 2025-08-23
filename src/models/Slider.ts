import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISlider extends Document {
    slider_image: string;
}

const sliderSchema: Schema = new Schema(
    {
        slider_image: {
            type: String,
            required: true
        }
    },
);

const Slider: Model<ISlider> = mongoose.models.Slider || mongoose.model<ISlider>('Slider', sliderSchema);

export default Slider;