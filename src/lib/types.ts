export type ItemCategory = 'Útiles' | 'Libros' | 'Uniformes';
export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';
export type ItemGradeLevel = 'Primaria' | 'Secundaria' | 'Bachillerato' | 'Todos';
export type ItemStatus = 'Disponible' | 'Reservado' | 'Entregado';

export type Item = {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  gradeLevel: ItemGradeLevel;
  imageUrl: string;
  imageHint: string;
  postedBy: string; // User's email
  isReserved: boolean;
  reservedBy?: string; // User's email
  status: ItemStatus;
};

export type User = {
  name: string;
  email: string;
  memberSince: string; // ISO date string
}
