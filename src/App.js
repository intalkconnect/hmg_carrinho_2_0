import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Checkout from './components/Checkout';
import CrudPage from './components/CrudPage';
import Dashboard from './components/Dashboard';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Checkout />,
    },
    {
      path: "/gerenciador",
      element: <CrudPage />,
    },
    {
      path: "/:id",
      element: <Checkout />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
