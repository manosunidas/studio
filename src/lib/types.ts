import { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';

/**
 * @fileoverview Defines the core data types used throughout the application.
 * This ensures consistency in data structures between Firestore, components, and other modules.
 */


// Defines the possible categories for a donation item.
export type ItemCategory = 'Ropa' | 'Útiles' | 'Tecnología' | 'Libros' | 'Uniformes' | 'Calzado';
// Defines the possible conditions of an item.
export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';
// Defines the school grade levels an item can be associated with.
export type ItemGradeLevel = 'Preescolar' | 'Primaria' | 'Secundaria' | 'Todos';
// Defines the availability status of an item.
export type ItemStatus = 'Disponible' | 'Asignado';

/**
 * Represents a single donation item stored in the 'materials' collection in Firestore.
 */
export interface Item {
  id: string; // The document ID from Firestore.
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  gradeLevel: ItemGradeLevel;
  imageUrl: string;
  imageHint: string; // A hint for AI-based image search/categorization.
  postedBy: string; // The UID of the admin user who posted the item.
  postedByName?: string; // The display name of the admin who posted.
  datePosted: Timestamp; // A Firestore Timestamp of when the item was posted.
  status: ItemStatus;
};

// Note: The `Solicitud` and `SolicitudStatus` types were removed as the
// request system was simplified to a direct email-based flow, removing the need

/**
 * Represents an application user. For this app, this type is primarily used for administrators.
 * It is an alias for the `User` type from the Firebase Authentication SDK.
 */
export type User = FirebaseUser;
