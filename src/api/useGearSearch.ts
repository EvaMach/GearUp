import { useConvex } from 'convex/react';
import { GearItem } from './gear';

export const useGearSearch = () => {
  const convex = useConvex();

  const searchGear = async (searchTerm: string): Promise<GearItem[]> => {
    if (!searchTerm) {
      return [];
    }

    try {
      const { api } = await import('../../convex/_generated/api');
      const results = await convex.query(api.gear.searchGear, { searchTerm });
      return results;
    } catch (error) {
      console.error('Error searching gear:', error);
      return [];
    }
  };

  return { searchGear };
};
