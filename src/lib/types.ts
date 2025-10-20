import { Timestamp } from "firebase/firestore";

export type ItemCategory = 'Útiles' | 'Libros' | 'Uniformes';
export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';
export type ItemGradeLevel = 'Primaria' | 'Secundaria' | 'Bachillerato' | 'Todos';
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
  postedBy: string; // User's email
  postedByName?: string; // User's display name
  datePosted: Timestamp;
  isReserved: boolean;
  reservedBy?: string; // User's email
  status: ItemStatus;
};

export type User = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  memberSince: string; // ISO date string
}
