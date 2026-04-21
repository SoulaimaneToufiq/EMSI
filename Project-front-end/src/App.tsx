import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage }         from '@/features/auth/LoginPage'
import { SignupPage }        from '@/features/auth/SignupPage'
import { DashboardPage }     from '@/features/dashboard/DashboardPage'
import { TasksPage }         from '@/features/tasks/TasksPage'
import { ProjectsPage }      from '@/features/projects/ProjectsPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { UsersPage }         from '@/features/users/UsersPage'
import { AutomationPage }   from '@/features/automation/AutomationPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"  element={<LoginPage />}  />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected – all authenticated roles */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"     element={<DashboardPage />}     />
                <Route path="/tasks"         element={<TasksPage />}         />
                <Route path="/projects"      element={<ProjectsPage />}      />
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Manager + Admin */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                  <Route path="/automation" element={<AutomationPage />} />
                </Route>

                {/* Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
