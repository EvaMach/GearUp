import { TripDetails } from './tripDetailsForm';

interface Props {
  details: TripDetails;
}

const TripDetailsBoard = ({ details }: Props): JSX.Element => {
  const tripTypeLabel = details.type === 'tent' ? 'Pod stanem' : 'Hotel';

  return (
    <div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm mb-3">
        Packing List
      </h1>
      <div className="flex items-center gap-2">
        <div className="glass-header px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-700">
          {details.stayLength} days
        </div>
        <div className="glass-header px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-700">
          {tripTypeLabel}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsBoard;
