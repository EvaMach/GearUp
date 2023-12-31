const API_BASE_URL = 'http://localhost:4000';

export interface Item {
  name: string;
  type: 'outdoor' | 'casual';
  amount: number;
}

export type GearList = Gear[];

export interface Gear {
  group: string;
  items: Item[];
}

export const fetchGearOptions = async (): Promise<GearList> => {
  const response = await fetch(`${API_BASE_URL}/gear`);
  const data = await response.json();
  return data;
};
