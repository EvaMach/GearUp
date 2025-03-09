import { TripDetails } from "./tripDetailsForm";

interface Props {
  details: TripDetails;
}

const TripDetailsBoard = ({ details }: Props): JSX.Element => {
  const tripTypeLabel = details.type === 'tent' ? 'Pod stanem' : 'Hotel';

  return (
    <div className="relative shadow-sm rounded-lg p-2 bg-white mb-2 w-full lg:w-1/2">
      <div className="font-medium">
        Počet dní: {details.stayLength}
      </div>
      <div className="font-medium">Typ výletu: {tripTypeLabel}</div>
    </div>
  );
};

export default TripDetailsBoard;