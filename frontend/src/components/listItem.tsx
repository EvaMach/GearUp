import {
  BinIcon,
  CheckedIcon,
  MinusIcon,
  PlusIcon,
  ShopIcon,
  UncheckedIcon,
} from '../libs/icons/icons';
import IconButton from './iconButton';
import { useState } from 'react';

interface Props {
  name: string;
  group: string;
  count: number;
  onRemove: (group: string, item: string) => void;
}

const ListItem = ({ group, name, count, onRemove }: Props): JSX.Element => {
  const [itemCount, setItemCount] = useState(count);
  const [checked, setChecked] = useState(false);

  const removeItem = (): void => {
    onRemove(group, name);
  };

  const changeItemCount = (operation?: 'plus' | 'minus'): void => {
    if (itemCount === 0 && operation === 'minus') {
      return;
    }
    if (itemCount === 99 && operation === 'plus') {
      return;
    }
    if (operation === 'plus') {
      setItemCount(itemCount + 1);
    } else {
      setItemCount(itemCount - 1);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      <div className="flex items-center gap-0.5">
        <IconButton
          className="bg-bgDark p-1 h-7 aspect-square rounded-md flex items-center justify-center"
          onClick={(): void => changeItemCount('minus')}
        >
          <MinusIcon className="fill-textColor w-2" />
        </IconButton>
        <input
          className="bg-bgDark rounded-md h-7 aspect-square text-center"
          type="number"
          value={itemCount}
          onChange={(e): void =>
            setItemCount(parseInt(e.target.value.slice(0, 2)))
          }
        ></input>
        <div className="flex flex-col">
          <IconButton
            className="bg-bgDark p-1 h-7 aspect-square rounded-md flex items-center justify-center"
            onClick={(): void => changeItemCount('plus')}
          >
            <PlusIcon className="fill-textColor w-2" />
          </IconButton>
        </div>
      </div>
      <button
        type="button"
        onClick={(): void => setChecked(!checked)}
        className={`flex lg:h-10 min-w-5 lg:min-w-15 justify-between items-center w-1/2 p-1 h-9 rounded px-2 
        ${checked ? 'bg-success' : 'bg-blueLight'}`}
      >
        <div className="text-left w-10/12 mr-1">
          <p className="overflow-auto whitespace-nowrap lg:whitespace-normal">
            {name}
          </p>
        </div>
        {checked ? (
          <CheckedIcon className="w-4" />
        ) : (
          <UncheckedIcon className="w-4" />
        )}
      </button>
      <img src="" alt="" />
      <IconButton onClick={removeItem}>
        <BinIcon className="fill-textColor w-5 hover:fill-primary mr-4" />
      </IconButton>
      <IconButton onClick={removeItem}>
        <ShopIcon className="fill-textColor w-5 hover:fill-accent" />
      </IconButton>
    </div>
  );
};

export default ListItem;
