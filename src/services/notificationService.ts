import admin from '../utils/firebase';
import { IAppUserDocument } from '../models/AppUser';
import mongoose from 'mongoose';

interface NotificationResponse {
  success: boolean;
  error?: unknown;
}

interface MulticastMessageResponse {
  responses: NotificationResponse[];
  successCount: number;
  failureCount: number;
}

class NotificationService {
  static async sendMultipleNotifications(
    deviceTokens: string[],
    title: string,
    body: string
  ): Promise<MulticastMessageResponse[]> {
    // Split into chunks of 500 tokens (Firebase limit)
    const chunkSize = 500;
    const tokenChunks: string[][] = [];

    for (let i = 0; i < deviceTokens.length; i += chunkSize) {
      tokenChunks.push(deviceTokens.slice(i, i + chunkSize));
    }

    try {
      const results: MulticastMessageResponse[] = [];

      for (const chunk of tokenChunks) {
        const message = {
          notification: {
            title,
            body
          },
          tokens: chunk
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        results.push(response);

        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`Failed to send notification to token ${chunk[idx]}: ${resp.error}`);
            }
          });
        }
      }

      console.info(`Successfully sent notifications to ${deviceTokens.length} devices`);
      return results;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error sending multiple notifications: ${error.message}`);
      }
      throw error;
    }
  }

  static async sendNotificationToAllUsers(
    title: string,
    body: string
  ): Promise<{ status: boolean; message: string; results?: MulticastMessageResponse[] }> {
    try {
      // Fetch all device tokens from the database
      const users = await mongoose.model<IAppUserDocument>('AppUser')
        .find({ deviceToken: { $exists: true, $ne: null } }, 'deviceToken');

      const deviceTokens = users.map(user => user.deviceToken).filter(token => token);

      if (deviceTokens.length === 0) {
        console.warn('No device tokens found to send notifications');
        return { status: false, message: 'No device tokens found' };
      }

      const results = await this.sendMultipleNotifications(deviceTokens, title, body);
      return { status: true, message: 'Notifications sent successfully', results };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error sending multiple notifications: ${error.message}`);
      }
      throw error;
    }
  }
}

export default NotificationService;