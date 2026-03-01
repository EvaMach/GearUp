import { useLocation } from 'react-router';
import { TripDetails } from './tripDetailsForm';
import GearListForm from './gearListForm';
import TripDetailsBoard from './tripDetails';
import { useAuth, SignUpButton } from '@clerk/clerk-react';

const GearListPage = (): JSX.Element => {
  const location = useLocation();
  const tripDetails = location.state as TripDetails;
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {isLoaded && !isSignedIn && (
        <div className="flex justify-end w-full px-8">
          <SignUpButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Save list
            </button>
          </SignUpButton>
        </div>
      )}
      <TripDetailsBoard details={tripDetails} />
      <GearListForm tripDetails={tripDetails} />
    </div>
  );
};

export default GearListPage;
