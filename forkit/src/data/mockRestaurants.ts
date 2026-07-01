export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  distanceMiles: number;
  address: string;
  photoUrl: string;
};

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Marigold & Rye',
    cuisine: 'American',
    rating: 4.6,
    priceLevel: 2,
    distanceMiles: 1.4,
    address: '214 Elm Street',
    photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  },
  {
    id: '2',
    name: 'Nori Lane',
    cuisine: 'Japanese',
    rating: 4.8,
    priceLevel: 3,
    distanceMiles: 2.7,
    address: '88 Harbor Way',
    photoUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
  },
  {
    id: '3',
    name: 'Casa Verde',
    cuisine: 'Mexican',
    rating: 4.3,
    priceLevel: 1,
    distanceMiles: 0.8,
    address: '19 Sunset Blvd',
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  },
];

export const cuisineOptions = [
  'American',
  'Bakery',
  'BBQ & Southern',
  'Breakfast',
  'Chinese',
  'Dessert',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Latin',
  'Mediterranean',
  'Mexican',
  'Seafood',
  'Thai',
  'Vegan',
  'Vietnamese',
];
