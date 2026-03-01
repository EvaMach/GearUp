import { SingleValue } from 'react-select';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  GearItemToPack,
  GroupedGearListToPack,
  groupAndMarkList,
} from '../api/gear';
import { useGearSearch } from '../api/useGearSearch';
import { debounce } from 'lodash';
import ListItem from './listItem';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { TripDetails } from './tripDetailsForm';
import { useAuth } from '@clerk/clerk-react';

interface LocalData {
  data: GroupedGearListToPack;
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
  item: GearItemToPack;
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
  const { searchGear } = useGearSearch();
  const { isLoaded, isSignedIn } = useAuth();
  const [groupWhereAlreaady, setGroupWhereAlready] = useState<string | null>(
    null
  );
  const [gearList, setGearList] = useState<GroupedGearListToPack | undefined>(
    undefined
  );
  const prevIsSignedIn = useRef<boolean | null>(null);
  const hasSavedRef = useRef(false);

  const createGearList = useMutation(api.gearLists.createGearList);
  const addItemToGearList = useMutation(api.gearLists.addItemToGearList);

  const gearData = useQuery(api.gear.getGear, {
    type: tripDetails.type as 'tent' | 'hotel' | undefined,
  });

  const gear = useMemo(() => {
    if (!gearData) {
      return undefined;
    }

    const localData = retrieveLocalData();
    if (
      tripDetails.timestamp !== undefined &&
      tripDetails.timestamp === localData?.timestamp
    ) {
      return localData.data;
    }

    return groupAndMarkList(gearData);
  }, [gearData, tripDetails.timestamp]);

  const isPending = gearData === undefined;

  useEffect(() => {
    if (gear !== undefined) {
      setGearList(gear);
    }
  }, [gear]);

  useEffect(() => {
    if (gearList !== undefined) {
      localStorage.setItem(
        'gearList',
        JSON.stringify({ timestamp: tripDetails.timestamp, data: gearList })
      );
    }
  }, [gearList, tripDetails.timestamp]);

  const saveToAccount = useCallback(
    async (list: GroupedGearListToPack) => {
      const date = new Date().toLocaleDateString('en-GB');
      const listName = `${tripDetails.type ?? 'camping'} trip – ${date}`;
      const gearListId = await createGearList({ name: listName });

      const allItems = Object.values(list).flat();
      const catalogItems = allItems.filter(
        (item): item is GearItemToPack & { _id: string } =>
          item._id !== undefined
      );

      await Promise.all(
        catalogItems.map((item) =>
          addItemToGearList({
            gearListId,
            gearId: item._id as Id<'gear'>,
            quantity: item.amount === 0 ? 1 : item.amount,
          })
        )
      );

      localStorage.removeItem('gearList');
    },
    [createGearList, addItemToGearList, tripDetails.type]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (
      prevIsSignedIn.current === false &&
      isSignedIn === true &&
      gearList !== undefined &&
      !hasSavedRef.current
    ) {
      hasSavedRef.current = true;
      saveToAccount(gearList);
    }
    prevIsSignedIn.current = isSignedIn ?? false;
  }, [isSignedIn, isLoaded, gearList, saveToAccount]);

  const fetchSuggestions = async (inputValue: string) => {
    try {
      const suggestions = await searchGear(inputValue);
      return suggestions.map((item) => ({
        value: { item: { ...item, packed: false }, group: item.group },
        label: item.name,
      }));
    } catch (error) {
      console.error('Error fetching options:', error);
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
    <button className="hover:text-accent" type="button">
      + {inputValue}
    </button>
  );

  const updateGearList = (newList: GroupedGearListToPack): void => {
    setGearList(newList);
    // With Convex, we don't need to manually update the cache
    // The data will be refetched automatically when needed
  };

  const removeItem = (group: string, itemName: string): void => {
    if (gearList === undefined) {
      return;
    }
    const updatedGroup = gearList[group].filter(
      (item) => item.name !== itemName
    );
    const updatedList = { ...gearList, [group]: updatedGroup };
    updateGearList(updatedList);
  };

  const addItem = (selectedItem: SingleValue<SelectOption>): void => {
    if (selectedItem === null || gearList === undefined) {
      return;
    }
    const { value } = selectedItem;
    const updatedGear = {
      ...gearList,
      [value.group]: [...gearList[value.group], value.item],
    };
    updateGearList(updatedGear);
  };

  const isItemAlreadyOnList = (itemName: string): boolean => {
    if (gearList === undefined) {
      return false;
    }
    return Object.values(gearList).some((group) =>
      group.some((item) => item.name === itemName)
    );
  };

  const createItem = (inputValue: string, group: string): void => {
    if (gearList === undefined) {
      return;
    }
    if (isItemAlreadyOnList(inputValue)) {
      setGroupWhereAlready(group);
      return;
    }
    const newItem: GearItemToPack = {
      name: inputValue,
      group: group,
      type: tripDetails.type,
      amount: 1,
      packed: false,
    };
    const updatedData = { ...gearList, [group]: [...gearList[group], newItem] };
    updateGearList(updatedData);
  };

  const handleItemChecked = (group: string, item: string): void => {
    if (gearList === undefined) {
      return;
    }
    const updatedGear = {
      ...gearList,
      [group]: gearList[group].map((gearItem) =>
        gearItem.name === item ? { ...gearItem, packed: true } : gearItem
      ),
    };
    updateGearList(updatedGear);
  };

  return (
    <>
      {isPending && (
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg">
          Načítám seznam...{' '}
        </div>
      )}
      {gearList !== undefined && (
        <div className="flex flex-col gap-2 bg-white/60 p-8 rounded-xl w-full">
          <div className="flex lg:flex-row items-start max-h-screen/4 w-full flex-col gap-2 lg:gap-8 rounded-lg overflow-x-auto">
            {Object.keys(gearList).map((group, index) => (
              <div
                className="flex max-h-screen min-w-fit overflow-y-auto flex-col gap-2 bg-white p-4 rounded-lg"
                key={index}
              >
                <h3 className="font-medium">{group}</h3>
                {gearList[group].map((dataItem) => (
                  <ListItem
                    key={dataItem.name}
                    group={group}
                    name={dataItem.name}
                    checked={dataItem.packed}
                    count={dataItem.amount === 0 ? 1 : dataItem.amount}
                    onRemove={removeItem}
                    onCheck={handleItemChecked}
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
                    onCreateOption={(inputValue) =>
                      createItem(inputValue, group)
                    }
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
      )}
    </>
  );
};

export default GearListForm;
