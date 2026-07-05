import { ApplicationLayout } from '@/layouts/ApplicationLayout/index.tsx';

import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '*',
    element: <ApplicationLayout />,
    children: [
      {
        path: '*',
        element: <ApplicationLayout />,
      },
    ],
  },
]);
