import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// @ts-ignore
import './index.css';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Copilot from './pages/Copilot';
import Shortlist from './pages/Shortlist';
import CarDetail from './pages/CarDetail';
import Compare from './pages/Compare';
import Browse from './pages/Browse';
import Contact from './pages/Contact';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/copilot/new" element={<Copilot />} />
          <Route path="/copilot/:sessionId" element={<Copilot />} />
          <Route path="/shortlist/:sessionId" element={<Shortlist />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/compare" element={<Compare />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
