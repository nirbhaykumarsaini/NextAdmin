import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAppConfig extends Document {
  app_title: string;
  logo_image: string;
}

const AppConfigSchema: Schema = new Schema(
  {
    app_title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    logo_image: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const AppConfig: Model<IAppConfig> = mongoose.models.AppConfig || mongoose.model<IAppConfig>('AppConfig', AppConfigSchema);

export default AppConfig;