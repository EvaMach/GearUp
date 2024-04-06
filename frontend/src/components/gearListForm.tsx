// eslint-disable-next-line import/named
import Select, { SingleValue } from 'react-select';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GearItem, GearList, fetchGearOptions } from '../api/gear';
import ListItem from './listItem';
import TripDetailsForm, { TripDetails } from './tripDetailsForm';
import FormSectionHead from './formSectionHead';

interface OptionValue {
  item: GearItem;
  group: string;
}

interface SelectOption {
  value: OptionValue;
  label: string;
}

const GearListForm = (): JSX.Element => {
  const gearList = useQuery({
    queryKey: ['gear'],
    queryFn: fetchGearOptions,
  });
  const [selectOptions, setSelectOptions] = useState<GearList>([]);
  const [groupWhereAlreaady, setGroupWhereAlready] = useState<string | null>(
    null
  );
  const [gearOnList, setGearOnList] = useState<GearList>([]);
  const [listVisible, setListVisible] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    stayLength: 3,
    type: 'tent',
  });
  const [selectValue, setSelectValue] = useState<SelectOption>({
    label: '',
    value: {
      item: {
        name: '',
        type: tripDetails.type,
        amount: 0,
      },
      group: '',
    },
  });

  useEffect(() => {
    if (gearList.status === 'success') {
      const filter = (item: GearItem): boolean =>
        item.type === tripDetails.type || item.type === 'all';

      const buildGearData = (
        filterFunction: (item: GearItem) => boolean
      ): GearList => {
        return gearList.data.map((gear) => ({
          group: gear.group,
          items: gear.items.filter(filterFunction).map((item) => {
            const amount = Math.round(tripDetails.stayLength * item.amount);
            return { ...item, amount };
          }),
        }));
      };

      setGearOnList(buildGearData((item) => filter(item)));
      setSelectOptions(buildGearData((item) => !filter(item)));
    }
  }, [gearList.status, gearList.data, tripDetails]);

  const isItemAlreadyOnList = (itemName: string): boolean =>
    gearOnList.some((group) => {
      return group.items.some((item) => item.name === itemName);
    });

  const handleItemAdded = (selectedItem: SingleValue<SelectOption>): void => {
    if (selectedItem === null) return;
    const { value } = selectedItem;
    const updatedList = gearOnList.map((gear) => {
      if (gear.group === value.group) {
        return { ...gear, items: [...gear.items, value.item] };
      }
      return gear;
    });
    setGearOnList([...updatedList]);

    const updatedSelectOptions = selectOptions.map((gear) => {
      if (gear.group === value.group) {
        return {
          ...gear,
          items: gear.items.filter((item) => item.name !== value.item.name),
        };
      }
      return gear;
    });
    setSelectOptions(updatedSelectOptions);
  };

  const handleItemRemoved = (group: string, itemName: string): void => {
    const updatedData = gearOnList.map((gear) => {
      if (gear.group === group) {
        return {
          ...gear,
          items: gear.items.filter((item) => itemName !== item.name),
        };
      }
      return gear;
    });
    setGearOnList([...updatedData]);

    const updatedSelectOptions = selectOptions.map((option) => {
      if (option.group === group) {
        const removedItem = gearOnList
          .find((gear) => gear.group === group)
          ?.items.find((item) => item.name === itemName);
        if (removedItem) {
          return {
            ...option,
            items: [...option.items, removedItem],
          };
        }
      }
      return option;
    });

    setSelectOptions([...updatedSelectOptions]);
  };

  const handleSubmitDetails = (submittedValues: TripDetails): void => {
    setListVisible(true);
    setTripDetails(submittedValues);
  };

  const handleNewItemCreated = (): void => {
    if (selectValue === null) {
      return;
    }
    if (isItemAlreadyOnList(selectValue.label)) {
      setGroupWhereAlready(selectValue.value.group);
      return;
    }
    const newItem: GearItem = {
      name: selectValue.label,
      type: tripDetails.type,
      amount: 1,
    };
    const updatedData = gearOnList.map((gear) => {
      if (gear.group === selectValue.value.group) {
        return { ...gear, items: [...gear.items, newItem] };
      }
      return gear;
    });
    setGearOnList([...updatedData]);
  };

  const createNewOption = (): JSX.Element => (
    <button
      className="hover:text-accent"
      type="button"
      onClick={handleNewItemCreated}
    >
      + {selectValue?.label}
    </button>
  );

  if (gearList.data) {
    return (
      <>
        <div className="flex flex-col items-center">
          <TripDetailsForm
            tripDetails={tripDetails}
            onChangeDetails={(): void => setListVisible(false)}
            onSubmitDetails={handleSubmitDetails}
          />
        </div>
        {listVisible && (
          <form className="flex flex-col gap-2">
            <FormSectionHead count={3} title="Balící seznam" />
            <div className="flex overflow-x-scroll bg-white rounded-lg shadow-sm p-2 flex-col gap-2 lg:flex-row lg:gap-14">
              {gearOnList.map((data, index) => (
                <div className="flex flex-col gap-2" key={index}>
                  <h3 className="font-medium">{data.group}</h3>
                  {data.items.map((dataItem) => (
                    <ListItem
                      key={dataItem.name}
                      group={data.group}
                      name={dataItem.name}
                      count={dataItem.amount === 0 ? 1 : dataItem.amount}
                      onRemove={handleItemRemoved}
                    />
                  ))}
                  <div className="w-full flex flex-col items-center">
                    <Select
                      menuPlacement="auto"
                      className="gear-select"
                      classNamePrefix={'gear-select'}
                      key={data.group + 'select'}
                      placeholder="Vybrat"
                      closeMenuOnSelect
                      value={
                        selectValue.value.group === data.group
                          ? selectValue
                          : null
                      }
                      onChange={handleItemAdded}
                      noOptionsMessage={createNewOption}
                      onInputChange={(inputValue): void =>
                        setSelectValue({
                          value: {
                            group: data.group,
                            item: {
                              name: inputValue,
                              type: tripDetails.type,
                              amount: 1,
                            },
                          },
                          label: inputValue,
                        })
                      }
                      options={selectOptions
                        .filter((gear) => gear.group === data.group)
                        .map((gear) =>
                          gear.items.map((item) => ({
                            value: { item: item, group: data.group },
                            label: item.name,
                          }))
                        )
                        .flat()}
                    ></Select>
                    {groupWhereAlreaady === data.group && (
                      <p className="bg-primary/30 text-center rounded w-1/2 lg:min-w-15">
                        Gear už je na seznamu.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </form>
        )}
      </>
    );
  }

  return <div>nothing</div>;
};

export default GearListForm;
