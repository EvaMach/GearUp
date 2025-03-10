const API_BASE_URL = 'http://localhost:8000/api';

export interface GearItem {
  _id?: string;
  name: string;
  group: string;
  type: 'tent' | 'hotel' | 'all';
  amount: number;
}
;
export interface GearItemToPack extends GearItem {
  packed: boolean;
}

export type GearList = GearItem[];

export interface GroupedGearList {
  [group: string]: GearList;
}

export interface GroupedGearListToPack {
  [group: string]: GearItemToPack[];
}

const groupAndMarkList = (gearList: GearItemToPack[]): GroupedGearListToPack => {
  return gearList.reduce((acc: GroupedGearListToPack, item) => {
    return {
      ...acc,
      [item.group]: [...(acc[item.group] ?? []), item]
    };
  }, {});
};

export const fetchGearList = async (type: string): Promise<GroupedGearListToPack> => {
  const response = await fetch(`${API_BASE_URL}/gear?type=${type}`);
  const data: GearList = await response.json();
  const dataWithPackedInfo: GearItemToPack[] = data.map((item) => ({ ...item, packed: false }));
  return groupAndMarkList(dataWithPackedInfo);
};

export const fetchGearSuggestions = async (input: string): Promise<GearList> => {
  const response = await fetch(`${API_BASE_URL}/options?q=${input}`);
  return await response.json();
};
