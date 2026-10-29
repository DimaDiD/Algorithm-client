import { FC } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage/HomePage';
import TopicPage from './pages/TopicPage/TopicPage';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:page" element={<TopicPage />} />
        <Route path="/:page/:subPage" element={<TopicPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
