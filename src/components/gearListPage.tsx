import { fetchGearList, GearItem, GearList, GroupedGearList } from "../api/gear";
import { useLocation } from "react-router";
import { TripDetails } from "./tripDetailsForm";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SingleValue } from "react-select";
import GearListForm from "./gearListForm";
import TripDetailsBoard from "./tripDetails";

interface OptionValue {
  item: GearItem;
  group: string;
}

interface SelectOption {
  value: OptionValue;
  label: string;
}

const GearListPage = (): JSX.Element => {
  const location = useLocation();
  const tripDetails = location.state as TripDetails;

  const { isPending, data: gearList, isError } = useQuery({
    queryKey: ['gear', tripDetails.type],
    queryFn: () => fetchGearList(tripDetails.type),
  });

  const [selectOptions, setSelectOptions] = useState<GearList>([]);

  const handleItemRemoved = (group: string, itemName: string): void => {
    // const updatedData = groupedGearList.map((gear) => {
    //   if (gear.group === group) {
    //     return {
    //       ...gear,
    //       items: gear.items.filter((item) => itemName !== item.name),
    //     };
    //   }
    //   return gear;
    // });
    // setGroupedGearList([...updatedData]);

    // const updatedSelectOptions = selectOptions.map((option) => {
    //   if (option.group === group) {
    //     const removedItem = groupedGearList
    //       .find((gear) => gear.group === group)
    //       ?.items.find((item) => item.name === itemName);
    //     if (removedItem) {
    //       return {
    //         ...option,
    //         items: [...option.items, removedItem],
    //       };
    //     }
    //   }
    //   return option;
    // });

    // setSelectOptions([...updatedSelectOptions]);
  };

  const handleNewItemCreated = (inputValue: string, dataGroup: string): void => {
    // if (isItemAlreadyOnList(inputValue)) {
    //   setGroupWhereAlready(selectValue.value.group);
    //   return;
    // }
    // const newItem: GearItem = {
    //   name: inputValue,
    //   type: tripDetails.type,
    //   amount: 1,
    // };
    // const updatedData = groupedGearList.map((gear) => {
    //   if (gear.group === dataGroup) {
    //     return { ...gear, items: [...gear.items, newItem] };
    //   }
    //   return gear;
    // });
    // setGroupedGearList([...updatedData]);
  };


  const handleItemAdded = (selectedItem: SingleValue<SelectOption>): void => {
    // if (selectedItem === null) return;
    // const { value } = selectedItem;
    // const updatedList = groupedGearList.map((gear) => {
    //   if (gear.group === value.group) {
    //     return { ...gear, items: [...gear.items, value.item] };
    //   }
    //   return gear;
    // });
    // setGroupedGearList([...updatedList]);

    // const updatedSelectOptions = selectOptions.map((gear) => {
    //   if (gear.group === value.group) {
    //     return {
    //       ...gear,
    //       items: gear.items.filter((item) => item.name !== value.item.name),
    //     };
    //   }
    //   return gear;
    // });
    // setSelectOptions(updatedSelectOptions);
  };

  return (
    <>
      <TripDetailsBoard details={tripDetails} />
      {isPending && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {gearList && (
        <>
          <GearListForm
            gear={gearList}
            onItemRemoved={handleItemRemoved}
            onItemAdded={handleItemAdded}
            onItemCreated={handleNewItemCreated}
          />
        </>
      )}
    </>
  );
};

export default GearListPage;