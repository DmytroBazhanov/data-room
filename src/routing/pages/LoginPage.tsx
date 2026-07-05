import { SignIn } from '@clerk/clerk-react';

export function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <SignIn
        routing="virtual"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg rounded-xl',
          },
        }}
      />
    </div>
  );
}
