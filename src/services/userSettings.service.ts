import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { UserSettings } from '@/types/preparacion';

export class UserSettingsService {
  private static readonly COLLECTION_NAME = 'userSettings';

  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId: docSnap.id,
          geminiApiKey: data.geminiApiKey,
          geminiModel: data.geminiModel || 'gemini-2.0-flash',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
        } as UserSettings;
      }

      return null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  static async saveUserSettings(settings: Partial<UserSettings> & { userId: string }): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, settings.userId);
      const now = Timestamp.now();

      const settingsData = {
        ...settings,
        updatedAt: now,
        createdAt: now,
      };

      await setDoc(docRef, settingsData, { merge: true });
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }
}
