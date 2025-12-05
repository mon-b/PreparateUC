import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class StorageService {
  static async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Simular progreso al inicio
      if (onProgress) {
        onProgress(0);
      }

      // Usar uploadBytes en lugar de uploadBytesResumable
      // uploadBytes no tiene problemas de CORS
      const snapshot = await uploadBytes(storageRef, file);

      // Simular progreso al finalizar
      if (onProgress) {
        onProgress(100);
      }

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    folder: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (onProgress) {
        onProgress(index, 0);
      }

      const url = await this.uploadFile(file, folder, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      });

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  }
}
