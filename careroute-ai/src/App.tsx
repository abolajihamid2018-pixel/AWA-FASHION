import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RequestPage } from './pages/RequestPage'
import { ServicesPage } from './pages/ServicesPage'
import { StatusPage } from './pages/StatusPage'
import { SubmittedPage } from './pages/SubmittedPage'

export default function App() {
  return (
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
      </Routes>
    </BrowserRouter>
  )
}
