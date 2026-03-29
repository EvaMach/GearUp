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
    <div className="-mx-3 sm:-mx-6 min-h-screen font-plus-jakarta relative">
      <div className="mountain-bg fixed inset-0 -z-20" />
      <div className="scenic-overlay fixed inset-0 -z-10" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 pt-6 max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <TripDetailsBoard details={tripDetails} />
          {isLoaded && !isSignedIn && (
            <SignUpButton mode="modal">
              <button className="glass-effect shrink-0 bg-[#2D5A27] text-white px-5 py-2.5 rounded-2xl font-extrabold text-sm transition-all hover:opacity-90 shadow-lg uppercase tracking-wider">
                Save list
              </button>
            </SignUpButton>
          )}
        </div>
        <GearListForm tripDetails={tripDetails} />
      </div>
    </div>
  );
};

export default GearListPage;
