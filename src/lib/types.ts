import { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';

export type ItemCategory = 'Ropa' | 'Útiles' | 'Tecnología' | 'Libros' | 'Uniformes';
export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';
export type ItemGradeLevel = 'Preescolar' | 'Primaria' | 'Secundaria' | 'Todos';
export type ItemStatus = 'Disponible' | 'Reservado' | 'Entregado';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  gradeLevel: ItemGradeLevel;
  imageUrl: string;
  imageHint: string;
  postedBy: string; // User's UID
  postedByName?: string; // User's display name
  datePosted: Timestamp;
  isReserved: boolean;
  reservedBy?: string; // User's email
  status: ItemStatus;
};

export type User = FirebaseUser;
