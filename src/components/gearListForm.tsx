import { SingleValue } from 'react-select';
import { useCallback, useEffect, useState } from 'react';
import { fetchGearList, fetchGearSuggestions, GearItem, GroupedGearList, PackedGroupedGearList } from '../api/gear';
import { debounce } from "lodash";
import ListItem from './listItem';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TripDetails } from './tripDetailsForm';

interface LocalData {
  data: PackedGroupedGearList;
  timestamp: string;
}

const retrieveLocalData = (): LocalData | null => {
  const localData = localStorage.getItem('gearList');
  if (localData) {
    return JSON.parse(localData);
  }
  return null;
};

interface OptionValue {
  item: GearItem;
  group: string;
}

interface SelectOption {
  value: OptionValue;
  label: string;
}

interface Props {
  tripDetails: TripDetails;
}

const GearListForm = ({ tripDetails }: Props): JSX.Element => {
  const queryClient = useQueryClient();
  const [groupWhereAlreaady, setGroupWhereAlready] = useState<string | null>(
    null
  );

  const fetchData = (): Promise<GroupedGearList> => {
    const localData = retrieveLocalData();
    if (tripDetails.timestamp !== undefined && tripDetails.timestamp === localData?.timestamp) {
      return Promise.resolve(localData.data);
    } else {
      return fetchGearList(tripDetails.type);
    }
  };

  const { isPending, data: gear, isError } = useQuery({
    queryKey: ['gear', tripDetails.type],
    queryFn: () => fetchData(),
  });

  useEffect(() => {
    if (gear !== undefined) {
      localStorage.setItem('gearList', JSON.stringify({ timestamp: tripDetails.timestamp, data: gear }));
    }
  }, [gear]);

  const fetchSuggestions = async (inputValue: string) => {
    try {
      const suggestions = await fetchGearSuggestions(inputValue);
      return (suggestions.map((item) => (
        {
          value: { item: item, group: item.group },
          label: item.name,
        })));
    } catch (error) {
      console.error("Error fetching options:", error);
      return [];
    }
  };

  const debouncedLoadOptions = useCallback(
    debounce(async (inputValue, callback) => {
      if (inputValue.length === 0) {
        return callback([]);
      }
      const gearOptions = await fetchSuggestions(inputValue);
      callback(gearOptions);
    }, 500),
    []
  );

  const createNewOption = (inputValue: string): JSX.Element => (
    <button
      className="hover:text-accent"
      type="button"
    >
      + {inputValue}
    </button>
  );

  const updateGearList = (newList: GroupedGearList): void => {
    localStorage.setItem('gearList', JSON.stringify({ timestamp: tripDetails.timestamp, data: newList }));
    queryClient.setQueryData(['gear', tripDetails.type], newList);
  };

  const removeItem = (group: string, itemName: string): void => {
    if (gear === undefined) {
      return;
    }
    const updatedGroup = gear[group].filter((item) => item.name !== itemName);
    const updatedList = { ...gear, [group]: updatedGroup };
    updateGearList(updatedList);
  };

  const addItem = (selectedItem: SingleValue<SelectOption>): void => {
    if (selectedItem === null || gear === undefined) {
      return;
    }
    const { value } = selectedItem;
    const updatedGear = { ...gear, [value.group]: [...gear[value.group], value.item] };
    updateGearList(updatedGear);
  };

  const isItemAlreadyOnList = (itemName: string): boolean => {
    if (gear === undefined) {
      return false;
    }
    return Object.values(gear).some((group) => group.some((item) => item.name === itemName));
  };

  const createItem = (inputValue: string, group: string): void => {
    if (gear === undefined) {
      return;
    }
    if (isItemAlreadyOnList(inputValue)) {
      setGroupWhereAlready(group);
      return;
    }
    const newItem: GearItem = {
      name: inputValue,
      group: group,
      type: tripDetails.type,
      amount: 1,
    };
    const updatedData = { ...gear, [group]: [...gear[group], newItem] };
    updateGearList(updatedData);
  };

  return (
    <>
      {isPending && <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg">Načítám seznam... </div>}
      {isError && <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg">Nastala chyba.</div>}
      {
        gear !== undefined && (
          <div className="flex flex-col gap-2 bg-white/60 p-8 rounded-xl">
            <div className="flex lg:flex-row max-h-screen/4 max-w-screen-lg flex-col gap-2 lg:gap-8 rounded-lg overflow-x-auto">
              {Object.keys(gear).map((group, index) => (
                <div className="flex max-h-screen min-w-fit overflow-y-auto flex-col gap-2 bg-white p-4 rounded-lg" key={index}>
                  <h3 className="font-medium">{group}</h3>
                  {gear[group].map((dataItem) => (
                    <ListItem
                      key={dataItem.name}
                      group={group}
                      name={dataItem.name}
                      count={dataItem.amount === 0 ? 1 : dataItem.amount}
                      onRemove={removeItem}
                    />
                  ))}
                  <div className="flex flex-col items-center ml-12">
                    <AsyncCreatableSelect
                      menuPlacement="auto"
                      className="gear-select"
                      classNamePrefix={'gear-select'}
                      key={group + 'select'}
                      controlShouldRenderValue={false}
                      placeholder="Vybrat"
                      closeMenuOnSelect
                      onCreateOption={(inputValue) => createItem(inputValue, group)}
                      formatCreateLabel={createNewOption}
                      onChange={addItem}
                      loadOptions={debouncedLoadOptions}
                    />
                    {groupWhereAlreaady === group && (
                      <p className="bg-primary/30 rounded w-1/2 lg:min-w-15 text-center">
                        Gear už je na seznamu.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    </>
  );
};

export default GearListForm;
