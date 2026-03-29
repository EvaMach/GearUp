import {
  BinIcon,
  CheckedIcon,
  MinusIcon,
  PlusIcon,
} from '../libs/icons/icons';
import IconButton from './iconButton';
import { useState } from 'react';

interface Props {
  name: string;
  group: string;
  count: number;
  onRemove: (group: string, item: string) => void;
  onCheck: (group: string, item: string) => void;
  checked: boolean;
}

const ListItem = ({
  group,
  name,
  count,
  onRemove,
  onCheck,
  checked,
}: Props): JSX.Element => {
  const [itemCount, setItemCount] = useState(count);

  const removeItem = (): void => {
    onRemove(group, name);
  };

  const changeItemCount = (operation?: 'plus' | 'minus'): void => {
    if (itemCount === 1 && operation === 'minus') {
      onRemove(group, name);
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
    <div className="glass-effect p-4 rounded-3xl shadow-lg border-white/30">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={(): void => onCheck(group, name)}
          className="shrink-0"
        >
          {checked ? (
            <div className="w-7 h-7 bg-[#2D5A27] rounded-xl flex items-center justify-center shadow-md">
              <CheckedIcon className="w-4 fill-white" />
            </div>
          ) : (
            <div className="w-7 h-7 border-2 border-slate-300 rounded-xl hover:border-[#2D5A27] transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-slate-900 ${
              checked ? 'line-through opacity-40' : ''
            }`}
          >
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-black/5 rounded-xl p-1">
            <IconButton
              className="w-6 h-6 flex items-center justify-center text-slate-500"
              onClick={(): void => changeItemCount('minus')}
            >
              <MinusIcon className="fill-slate-500 w-2.5" />
            </IconButton>
            <span className="w-6 text-center text-xs font-black text-slate-900">
              {Math.ceil(itemCount)}
            </span>
            <IconButton
              className="w-6 h-6 flex items-center justify-center text-slate-500"
              onClick={(): void => changeItemCount('plus')}
            >
              <PlusIcon className="fill-slate-500 w-2.5" />
            </IconButton>
          </div>
          <IconButton onClick={removeItem} className="p-2">
            <BinIcon className="fill-slate-400 w-5 hover:fill-red-500 transition-colors" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
