import { useLocation } from "react-router";
import { TripDetails } from "./tripDetailsForm";
import GearListForm from "./gearListForm";
import TripDetailsBoard from "./tripDetails";

const GearListPage = (): JSX.Element => {
  const location = useLocation();
  const tripDetails = location.state as TripDetails;

  return (
    <div className="flex flex-col items-center gap-6">
      <TripDetailsBoard details={tripDetails} />
      <GearListForm
        tripDetails={tripDetails}
      />
    </div>
  );
};

export default GearListPage;