import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = (): JSX.Element => {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/gear-list"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
