import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Device information interface
export interface IDeviceInfo {
  device_id: string;
  device_model?: string;
  os?: string;
  browser?: string;
  ip_address?: string;
  last_login?: Date;
}

export interface IAppUser {
  name: string;
  mobile_number: string;
  password: string;
  simplepassword:string;
  m_pin: number;
  otp:string;
  is_verified?: boolean;
  is_blocked?: boolean;
  created_at?: Date;
  updated_at?: Date;
  batting: boolean;
  balance: number;
  devices: IDeviceInfo[];
  email: string,
  date_of_birth: string;
  address: string;
  occupation: string;
  deviceToken: string;
}

export interface IAppUserDocument extends IAppUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  addDevice(deviceInfo: IDeviceInfo): Promise<void>;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const deviceInfoSchema = new Schema({
  device_id: {
    type: String,
    // required: true
  },
  device_model: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  ip_address: {
    type: String,
    default: 'Unknown'
  },
  last_login: {
    type: Date,
    default: Date.now
  }
});

const appUserSchema = new Schema<IAppUserDocument, Model<IAppUserDocument>>(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    mobile_number: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    simplepassword: {
      type: String,
      trim: true
    },
    m_pin: {
      type: Number,
      trim: true
    },
    otp:{
      ype: String,
      trim: true
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    is_blocked: {
      type: Boolean,
      default: false
    },
    balance: {
      type: Number,
      default: 10,
      min: 0
    },
    batting: {
      type: Boolean,
      default: true
    },
    devices: [deviceInfoSchema],
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          if (!email) return true;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    date_of_birth: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true
    },
    occupation: {
      type: String,
      trim: true
    },
    deviceToken: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

appUserSchema.pre<IAppUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

appUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

appUserSchema.methods.addDevice = async function (deviceInfo: IDeviceInfo): Promise<void> {
  const existingDeviceIndex = this.devices.findIndex(
    (device: IDeviceInfo) => device.device_id === deviceInfo.device_id
  );

  if (existingDeviceIndex !== -1) {
    this.devices[existingDeviceIndex] = {
      ...this.devices[existingDeviceIndex],
      ...deviceInfo,
      last_login: new Date()
    };
  } else {
    this.devices.push({
      ...deviceInfo,
      last_login: new Date()
    });
  }

  await this.save();
};

const AppUser = mongoose.models.AppUser || mongoose.model<IAppUserDocument>('AppUser', appUserSchema);
export default AppUser;