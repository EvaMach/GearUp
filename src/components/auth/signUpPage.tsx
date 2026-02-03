import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = (): JSX.Element => {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/gear-list"
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

export default SignUpPage;
