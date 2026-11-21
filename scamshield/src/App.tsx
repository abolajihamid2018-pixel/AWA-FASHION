import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MessageAnalysisPage from './pages/MessageAnalysisPage';
import UrlAnalysisPage from './pages/UrlAnalysisPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import LearnPage from './pages/LearnPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

/** Every page in the app and the address it lives at. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="analyse" element={<DashboardPage />} />
        <Route path="analyse/message" element={<MessageAnalysisPage />} />
        <Route path="analyse/url" element={<UrlAnalysisPage />} />
        <Route path="results/:id" element={<ResultPage />} />
        <Route path="example/:sampleId" element={<ResultPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
