import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import './index.css';

const App: React.FC = () => {

  return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage/>}/>
                </Route>
            </Routes>
        </Router>
  );
};

export default App
