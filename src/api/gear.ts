const API_BASE_URL = 'http://localhost:8000/api';

export interface GearItem {
  name: string;
  group: string;
  type: 'tent' | 'hotel' | 'all';
  amount: number;
}

export interface PackedGearItem extends GearItem {
  packed: boolean;
}

export type GearList = GearItem[];

export interface GroupedGearList {
  [group: string]: GearList;
}

const groupGearList = (gearList: GearList): GroupedGearList => {
  return gearList.reduce((acc: GroupedGearList, item) => {
    if (acc[item.group] === undefined) {
      return { ...acc, [item.group]: [] };
    }
    return { ...acc, [item.group]: acc[item.group] };
  }, {});
};

export const fetchGearList = async (type: string): Promise<GroupedGearList> => {
  const response = await fetch(`${API_BASE_URL}/gear?type=${type}`);
  const data: GearList = await response.json();
  return groupGearList(data);
};

export const fetchGearOptions = async (input: string): Promise<GearList> => {
  const response = await fetch(`${API_BASE_URL}/options?q=${input}`);
  console.log(response);
  const json = await response.json();
  return json.data;
}


