export type ItemCategory = 'Útiles' | 'Libros' | 'Uniformes';
export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';
export type ItemGradeLevel = 'Primaria' | 'Secundaria' | 'Bachillerato' | 'Todos';

export type Item = {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  gradeLevel: ItemGradeLevel;
  imageUrl: string;
  imageHint: string;
  postedBy: string; // Should be a user ID in a real app
  isReserved: boolean;
};
