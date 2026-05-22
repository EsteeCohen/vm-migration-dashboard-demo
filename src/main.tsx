import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import './index.css';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { PlansPage } from './pages/PlansPage';
import { PlanNewPage } from './pages/PlanNewPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { ClusterPage } from './pages/ClusterPage';
import { AboutPage } from './pages/AboutPage';
import { MigrationProvider } from './context/MigrationContext';
import { LanguageProvider } from './context/LanguageContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'providers', element: <ProvidersPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'plans/new', element: <PlanNewPage /> },
      { path: 'plans/:id', element: <PlanDetailPage /> },
      { path: 'cluster', element: <ClusterPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <MigrationProvider>
        <RouterProvider router={router} />
      </MigrationProvider>
    </LanguageProvider>
  </React.StrictMode>
);