import { FC, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CatalogPage from './pages/CatalogPage/CatalogPage';
import CoursePage from './pages/CoursePage/CoursePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AboutPage from "./pages/AboutPage/AboutPage";
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';
import TopicPage from './pages/TopicPage/TopicPage';
import { useTable } from './Store';

const App: FC = () => {
  const [, actions] = useTable();

  useEffect(() => {
    actions.loadLanguages();
  }, [actions]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/courses/:courseSlug" element={<CoursePage />} />
        <Route path="/courses/:courseSlug/dashboard" element={<DashboardPage />} />
        <Route path="/courses/:courseSlug/:page" element={<TopicPage />} />
        <Route path="/courses/:courseSlug/:page/:subPage" element={<TopicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
