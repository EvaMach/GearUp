// eslint-disable-next-line import/named
import Select, { SingleValue } from 'react-select';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gear, GearItem, GearList, fetchGearOptions } from '../api/gear';
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
  const [allGear, setAllGear] = useState<GearList>([]);
  const [groupWhereAlreaady, setGroupWhereAlready] = useState<string | null>(
    null
  );
  const [filteredGear, setFilteredGear] = useState<GearList>([]);
  const [listVisible, setListVisible] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    stayLength: 3,
    type: 'tent',
  });
  const [selectValue, setSelectValue] = useState({
    value: '',
    group: '',
  });

  useEffect(() => {
    if (gearList.status === 'success') {
      setAllGear(gearList.data);
      setFilteredGear(
        gearList.data.map((gear: Gear) => ({
          group: gear.group,
          items: gear.items
            .filter(
              (item) => item.type === tripDetails.type || item.type === 'all'
            )
            .map((item) => {
              const amount = Math.round(tripDetails.stayLength * item.amount);
              return { ...item, amount };
            }),
        }))
      );
    }
  }, [gearList.status, gearList.data, tripDetails]);

  const isItemAlreadyOnList = (itemName: string): boolean =>
    filteredGear.some((group) => {
      return group.items.some((item) => item.name === itemName);
    });

  const handleItemAdded = (selected: SingleValue<SelectOption>): void => {
    if (selected === null) return;
    const { value } = selected;
    setGroupWhereAlready(null);
    if (isItemAlreadyOnList(value.item.name)) {
      setGroupWhereAlready(value.group);
      return;
    }
    const updatedData = filteredGear.map((gear) => {
      if (gear.group === value.group) {
        return { ...gear, items: [...gear.items, value.item] };
      }
      return gear;
    });
    setFilteredGear([...updatedData]);
  };

  const handleItemRemoved = (group: string, itemName: string): void => {
    const updatedData = filteredGear.map((gear) => {
      if (gear.group === group) {
        return {
          ...gear,
          items: gear.items.filter((item) => itemName !== item.name),
        };
      }
      return gear;
    });
    setFilteredGear([...updatedData]);
  };

  const handleSubmitDetails = (submittedValues: TripDetails): void => {
    setListVisible(true);
    setTripDetails(submittedValues);
  };

  const handleNewItemCreated = (): void => {
    if (isItemAlreadyOnList(selectValue.value)) {
      setGroupWhereAlready(selectValue.group);
      return;
    }
    const newItem: GearItem = {
      name: selectValue.value,
      type: tripDetails.type,
      amount: 1,
    };
    const updatedData = filteredGear.map((gear) => {
      if (gear.group === selectValue.group) {
        return { ...gear, items: [...gear.items, newItem] };
      }
      return gear;
    });
    setFilteredGear([...updatedData]);
    setSelectValue({ value: '', group: '' });
  };

  const createNewOption = (): JSX.Element => (
    <button
      className="hover:text-accent"
      type="button"
      onClick={handleNewItemCreated}
    >
      + {selectValue.value}
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
            <div className="flex max-h-[90vh] overflow-scroll bg-white rounded-lg shadow-sm p-2 flex-col gap-2 lg:flex-row lg:gap-14">
              {filteredGear.map((data, index) => (
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
                      onChange={handleItemAdded}
                      noOptionsMessage={createNewOption}
                      inputValue={
                        selectValue.group === data.group
                          ? selectValue.value
                          : ''
                      }
                      onInputChange={(inputValue): void =>
                        setSelectValue({ value: inputValue, group: data.group })
                      }
                      options={allGear
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
