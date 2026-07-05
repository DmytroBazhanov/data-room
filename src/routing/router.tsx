import { ApplicationLayout } from '@/layouts/ApplicationLayout/index.tsx';

import { createBrowserRouter } from 'react-router-dom';
import App from '@/App.tsx';

export const router = createBrowserRouter([
  {
    path: '*',
    element: <ApplicationLayout />,
    children: [
      {
        path: '*',
        element: <App />,
      },
    ],
  },
]);
