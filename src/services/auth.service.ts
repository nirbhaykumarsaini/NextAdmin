import User from '@/models/User';
import Token from '@/models/Token';
import { generateToken, verifyToken } from '@/lib/auth/jwt';
import { setCookie, deleteCookie } from '@/lib/auth/cookies';
import { ILogin, IRegister } from '@/types/auth';
import ApiError from '@/lib/errors/APiError';
import { JWT_ACCESS_EXPIRATION, JWT_REFRESH_EXPIRATION } from '@/constants/index';
import logger from '@/config/logger';

class AuthService {
  async register(userData: IRegister) {
    // Validate input data
    if (!userData.username || !userData.password) {
      throw new ApiError('Username and password are required');
    }

    // Check if admin already exists if trying to create admin
    if (userData.role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        throw new ApiError('Admin user already exists', 400);
      }
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new ApiError('Username already taken', 400);
    }

    const user = await User.create(userData);
    return user;
  }

  async login(loginData: ILogin) {
    // Validate input data
    if (!loginData.username || !loginData.password) {
      throw new ApiError('Username and password are required', 400);
    }

    const { username, password } = loginData;
    
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      throw new ApiError('Incorrect username or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError('Incorrect username or password', 401);
    }

    const accessToken = generateToken(user._id, 'access');
    const refreshToken = generateToken(user._id, 'refresh');

    // Save refresh token to DB
    await Token.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + parseInt(JWT_REFRESH_EXPIRATION) * 1000),
      type: 'refresh',
    });

    // Set cookies
    setCookie('accessToken', accessToken, { maxAge: parseInt(JWT_ACCESS_EXPIRATION) });
    setCookie('refreshToken', refreshToken, { maxAge: parseInt(JWT_REFRESH_EXPIRATION) });

    // Return user data without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return { 
      status: true,
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken 
    };
  }

  async logout(refreshToken: string) {
    const refreshTokenDoc = await Token.findOneAndDelete({ 
      token: refreshToken,
      type: 'refresh',
    });

    if (!refreshTokenDoc) {
      throw new ApiError('Token not found', 404);
    }

    // Clear cookies
    deleteCookie('accessToken');
    deleteCookie('refreshToken');

    return { 
      status: true,
      message: 'Logged out successfully' 
    };
  }

  async refreshAuth(refreshToken: string) {
    try {
      const payload = verifyToken(refreshToken);
      const tokenDoc = await Token.findOne({
        token: refreshToken,
        type: 'refresh',
        userId: payload.sub,
        blacklisted: false,
      });

      if (!tokenDoc) {
        throw new ApiError('Token not found', 404);
      }

      const newAccessToken = generateToken(payload.sub, 'access');
      setCookie('accessToken', newAccessToken, { maxAge: parseInt(JWT_ACCESS_EXPIRATION) });

      return { 
        status: true,
        accessToken: newAccessToken 
      };
    } catch (error) {
      throw new ApiError('Please authenticate', 401);
    }
  }
}

export default new AuthService();