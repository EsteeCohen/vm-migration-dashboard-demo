import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import { LoginPage } from './pages/LoginPage';
import { MigrationProvider } from './context/MigrationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true,              element: <DashboardPage /> },
      { path: 'providers',        element: <ProvidersPage /> },
      { path: 'plans',            element: <PlansPage /> },
      { path: 'plans/new',        element: <PlanNewPage /> },
      { path: 'plans/:id',        element: <PlanDetailPage /> },
      { path: 'cluster',          element: <ClusterPage /> },
      { path: 'about',            element: <AboutPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'UNCONFIGURED'}>
        <LanguageProvider>
          <AuthProvider>
            <MigrationProvider>
              <RouterProvider router={router} />
            </MigrationProvider>
          </AuthProvider>
        </LanguageProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
