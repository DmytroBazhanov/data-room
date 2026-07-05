import type { ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { LoginPage } from '@/routing/pages/LoginPage.tsx';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
