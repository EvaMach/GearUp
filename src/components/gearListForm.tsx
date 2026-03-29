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
  const [selectedGroup, setSelectedGroup] = useState<string>('');
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
    if (gearList !== undefined && selectedGroup === '') {
      setSelectedGroup(Object.keys(gearList)[0] ?? '');
    }
  }, [gearList, selectedGroup]);

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
    <button className="hover:text-[#2D5A27]" type="button">
      + {inputValue}
    </button>
  );

  const updateGearList = (newList: GroupedGearListToPack): void => {
    setGearList(newList);
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

  const createItem = (inputValue: string): void => {
    if (gearList === undefined || selectedGroup === '') return;
    if (isItemAlreadyOnList(inputValue)) {
      setGroupWhereAlready(selectedGroup);
      return;
    }
    const newItem: GearItemToPack = {
      name: inputValue,
      group: selectedGroup,
      type: tripDetails.type,
      amount: 1,
      packed: false,
    };
    updateGearList({
      ...gearList,
      [selectedGroup]: [...gearList[selectedGroup], newItem],
    });
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
        <div className="glass-effect p-6 rounded-2xl text-slate-700 text-center shadow-lg">
          Načítám seznam...
        </div>
      )}
      {gearList !== undefined && (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <AsyncCreatableSelect
                menuPlacement="auto"
                className="gear-select w-full"
                classNamePrefix="gear-select"
                controlShouldRenderValue={false}
                placeholder="Add gear..."
                closeMenuOnSelect
                onCreateOption={createItem}
                formatCreateLabel={createNewOption}
                onChange={addItem}
                loadOptions={debouncedLoadOptions}
              />
            </div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="glass-effect border-none rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 shadow-md"
            >
              {Object.keys(gearList).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          {groupWhereAlreaady !== null && (
            <p className="glass-effect rounded-xl px-3 py-2 text-sm text-center text-slate-700">
              Gear už je na seznamu.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Object.keys(gearList).map((group) => {
              const total = gearList[group].length;
              const packed = gearList[group].filter(
                (item) => item.packed
              ).length;
              const allPacked = packed === total && total > 0;
              return (
                <section key={group} className="mb-2">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                      {group}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        allPacked
                          ? 'text-white bg-[#2D5A27]'
                          : 'text-[#2D5A27] bg-[#2D5A27]/10'
                      }`}
                    >
                      {packed} / {total}
                    </span>
                  </div>
                  <div className="space-y-4">
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
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default GearListForm;
