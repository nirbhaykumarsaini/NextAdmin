import User from '@/models/User';
import ApiError from '@/lib/errors/APiError';
import { IUser } from '@/types/user';

class UserService {
  async getAllUsers() {
    return await User.find().select('-password');
  }

  async getUserById(id: string) {
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async updateUser(id: string, updateData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

export default new UserService();