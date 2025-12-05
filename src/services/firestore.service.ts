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

      // Convert materialesGenerados dates to Timestamps
      if (updates.materialesGenerados) {
        updateData.materialesGenerados = updates.materialesGenerados.map((material: any) => ({
          ...material,
          createdAt: material.createdAt instanceof Date
            ? Timestamp.fromDate(material.createdAt)
            : material.createdAt,
        }));
      }

      // Convert documentosExtra dates to Timestamps
      if (updates.documentosExtra) {
        updateData.documentosExtra = updates.documentosExtra.map((doc: any) => ({
          ...doc,
          uploadedAt: doc.uploadedAt instanceof Date
            ? Timestamp.fromDate(doc.uploadedAt)
            : doc.uploadedAt,
        }));
      }

      // Convert forumPosts dates to Timestamps
      if (updates.forumPosts) {
        updateData.forumPosts = updates.forumPosts.map((post: any) => ({
          ...post,
          createdAt: post.createdAt instanceof Date
            ? Timestamp.fromDate(post.createdAt)
            : post.createdAt,
          updatedAt: post.updatedAt instanceof Date
            ? Timestamp.fromDate(post.updatedAt)
            : post.updatedAt,
        }));
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

        // Convert materialesGenerados dates
        const materialesGenerados = data.materialesGenerados?.map((material: any) => ({
          ...material,
          createdAt: material.createdAt?.toDate ? material.createdAt.toDate() : material.createdAt,
        })) || [];

        // Convert documentosExtra dates
        const documentosExtra = data.documentosExtra?.map((doc: any) => ({
          ...doc,
          uploadedAt: doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt,
        })) || [];

        // Convert forumPosts dates
        const forumPosts = data.forumPosts?.map((post: any) => ({
          ...post,
          createdAt: post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt,
          updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate() : post.updatedAt,
        })) || [];

        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          materialesGenerados,
          documentosExtra,
          forumPosts,
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

  static async obtenerTodasPreparaciones(limit?: number): Promise<Preparacion[]> {
    try {
      const q = limit
        ? query(
            collection(db, this.COLLECTION_NAME),
            orderBy('createdAt', 'desc'),
            // Note: You can add a limit here if needed
          )
        : query(
            collection(db, this.COLLECTION_NAME),
            orderBy('createdAt', 'desc')
          );

      const querySnapshot = await getDocs(q);
      const preparaciones: Preparacion[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        preparaciones.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Preparacion);
      });

      return preparaciones;
    } catch (error) {
      console.error('Error getting all preparaciones:', error);
      throw error;
    }
  }
}
