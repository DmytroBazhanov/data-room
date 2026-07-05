import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard } from '@/routing/pages/AuthGuard.tsx';
import { ApplicationLayout } from '@/layouts/ApplicationLayout/index.tsx';
import { LoginPage } from '@/routing/pages/LoginPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <ApplicationLayout />
      </AuthGuard>
    ),
  },
  {
    path: '/:roomId/*',
    element: (
      <AuthGuard>
        <ApplicationLayout />
      </AuthGuard>
    ),
  },
]);
