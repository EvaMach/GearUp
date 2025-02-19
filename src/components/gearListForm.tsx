import { SingleValue } from 'react-select';
import { useCallback, useState } from 'react';
import { fetchGearOptions, GearItem, GroupedGearList } from '../api/gear';
import FormSectionHead from './formSectionHead';
import { debounce } from "lodash";
import ListItem from './listItem';
import AsyncCreatableSelect from 'react-select/async-creatable';

interface OptionValue {
  item: GearItem;
  group: string;
}

interface SelectOption {
  value: OptionValue;
  label: string;
}

interface Props {
  gear: GroupedGearList;
  onItemRemoved: (group: string, itemName: string) => void;
  onItemAdded: (value: SingleValue<SelectOption>) => void;
  onItemCreated: (value: string, group: string) => void;
}

const GearListForm = ({ gear, onItemRemoved, onItemAdded, onItemCreated }: Props): JSX.Element => {
  const [groupWhereAlreaady, setGroupWhereAlready] = useState<string | null>(
    null
  );
  // const isItemAlreadyOnList = (itemName: string): boolean =>
  //   gear.some((group) => {
  //     return group.items.some((item) => item.name === itemName);
  //   });

  const fetchOptions = async (inputValue: string) => {
    try {
      const gearOptions = await fetchGearOptions(inputValue);
      return (gearOptions.map(
        (item) => ({ value: { item: item, group: item.type }, label: item.name, })));
    } catch (error) {
      console.error("Error fetching options:", error);
      return [];
    }
  };

  const debouncedLoadOptions = useCallback(
    debounce(async (inputValue, callback) => {
      if (!inputValue) {
        return callback([]);
      }
      const gearOptions = await fetchOptions(inputValue);
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

  return (
    <form className="flex flex-col gap-2">
      <FormSectionHead count={3} title="Balící seznam" />
      <div className="flex lg:flex-row max-w-full overflox-auto max-h-screen/4 flex-col gap-2 lg:gap-8 p-2 rounded-lg overflow-x-scroll">
        {Object.keys(gear).map((group, index) => (
          <div className="flex max-h-screen min-w-fit overflow-y-auto flex-col gap-2 bg-white p-4 rounded-lg" key={index}>
            <h3 className="font-medium">{group}</h3>
            {gear[group].map((dataItem) => (
              <ListItem
                key={dataItem.name}
                group={group}
                name={dataItem.name}
                count={dataItem.amount === 0 ? 1 : dataItem.amount}
                onRemove={onItemRemoved}
              />
            ))}
            <div className="flex flex-col items-center w-full">
              <AsyncCreatableSelect
                menuPlacement="auto"
                className="gear-select"
                classNamePrefix={'gear-select'}
                key={group + 'select'}
                controlShouldRenderValue={false}
                placeholder="Vybrat"
                closeMenuOnSelect
                onCreateOption={(inputValue) => onItemCreated(inputValue, group)}
                formatCreateLabel={createNewOption}
                onChange={onItemAdded}
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
    </form>
  );
};

export default GearListForm;
