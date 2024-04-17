import { FC } from 'react';
import './App.css';
import { MainPage } from './Pages/MainPage';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { InfoPage } from './Pages/InfoPage/InfoPage';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/:page" element={<InfoPage/>}/>
        <Route path="/:page/:subPage" element={<InfoPage/>}/>        
      </Routes>
      </BrowserRouter>
  );
}

export default App;
