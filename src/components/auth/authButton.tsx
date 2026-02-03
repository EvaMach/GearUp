import React from 'react';
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react';

interface AuthButtonProps {
  variant?: 'header' | 'inline';
}

const AuthButton = ({ variant = 'header' }: AuthButtonProps): JSX.Element => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading skeleton while auth is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Show sign-in button if not authenticated
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className={`${
            variant === 'header'
              ? 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
              : 'text-blue-600 hover:text-blue-800 font-medium'
          }`}
        >
          Sign In
        </button>
      </SignInButton>
    );
  }

  // Show user button with avatar and menu when authenticated
  return (
    <div className="flex items-center gap-3">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
          },
        }}
      />
    </div>
  );
};

export default AuthButton;
