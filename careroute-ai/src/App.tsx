import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StaffLayout } from './components/StaffLayout'
import { AuthProvider } from './lib/auth'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RequestPage } from './pages/RequestPage'
import { ServicesPage } from './pages/ServicesPage'
import { StatusPage } from './pages/StatusPage'
import { SubmittedPage } from './pages/SubmittedPage'
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage'
import { StaffLoginPage } from './pages/staff/StaffLoginPage'
import { StaffRequestPage } from './pages/staff/StaffRequestPage'

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="request/submitted" element={<SubmittedPage />} />
          <Route path="request/:slug" element={<RequestPage />} />
          <Route path="status/:token" element={<StatusPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="staff/login" element={<StaffLoginPage />} />
        <Route path="staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboardPage />} />
          <Route path="requests/:id" element={<StaffRequestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}
