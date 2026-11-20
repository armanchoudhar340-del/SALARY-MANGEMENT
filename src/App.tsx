import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SyncProvider } from './context/SyncContext';
import { Layout } from './components/layout/Layout';

// Lazy-loaded pages for optimal route-based code splitting
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const EmployeesPage = lazy(() =>
  import('./pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage }))
);
const AttendancePage = lazy(() =>
  import('./pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const PaymentsPage = lazy(() =>
  import('./pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage }))
);
const MonthlySalaryPage = lazy(() =>
  import('./pages/MonthlySalaryPage').then((m) => ({ default: m.MonthlySalaryPage }))
);
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const HelpPage = lazy(() =>
  import('./pages/HelpPage').then((m) => ({ default: m.HelpPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader: React.FC = () => (
  <div className="p-6 space-y-4 max-w-7xl mx-auto animate-pulse">
    <div className="h-28 bg-purple-100/60 rounded-3xl" />
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-200/60 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-200/60 rounded-2xl" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7fd] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <SyncProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="monthly-salary" element={<MonthlySalaryPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="help" element={<HelpPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SyncProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
