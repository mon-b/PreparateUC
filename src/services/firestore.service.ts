import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Preparacion } from '@/types/preparacion';

export class FirestoreService {
  private static readonly COLLECTION_NAME = 'preparaciones';

  static async crearPreparacion(preparacion: Omit<Preparacion, 'id'>): Promise<string> {
    try {
      const preparacionData = {
        ...preparacion,
        fechaExamen: Timestamp.fromDate(preparacion.fechaExamen),
        createdAt: Timestamp.fromDate(preparacion.createdAt),
        updatedAt: Timestamp.fromDate(preparacion.updatedAt),
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        preparacionData
      );

      return docRef.id;
    } catch (error) {
      console.error('Error creating preparacion:', error);
      throw error;
    }
  }

  static async actualizarPreparacion(
    id: string,
    updates: Partial<Preparacion>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = { ...updates };

      if (updates.fechaExamen) {
        updateData.fechaExamen = Timestamp.fromDate(updates.fechaExamen);
      }

      updateData.updatedAt = Timestamp.now();

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating preparacion:', error);
      throw error;
    }
  }

  static async obtenerPreparacion(id: string): Promise<Preparacion | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fechaExamen: data.fechaExamen.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Preparacion;
      }

      return null;
    } catch (error) {
      console.error('Error getting preparacion:', error);
      throw error;
    }
  }

  static async obtenerPreparacionesPorUsuario(userId: string): Promise<Preparacion[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const preparaciones: Preparacion[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        preparaciones.push({
          id: doc.id,
          ...data,
          fechaExamen: data.fechaExamen.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Preparacion);
      });

      return preparaciones;
    } catch (error) {
      console.error('Error getting preparaciones:', error);
      throw error;
    }
  }
}
