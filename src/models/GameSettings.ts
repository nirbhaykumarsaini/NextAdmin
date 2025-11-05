import mongoose, { Schema, Document, models } from "mongoose"

export interface IGameSettings extends Document {
  galidisawar: boolean
  starline: boolean
  updatedAt?: Date
}

const GameSettingsSchema = new Schema<IGameSettings>(
  {
    galidisawar: { type: Boolean, default: false },
    starline: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const GameSettings =
  models.GameSettings || mongoose.model<IGameSettings>("GameSettings", GameSettingsSchema)

export default GameSettings
