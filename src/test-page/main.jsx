import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { defaultComponentKey, getRoutePathForComponentKey } from './demoRoutes.js';
import DevPage from './DevPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to={getRoutePathForComponentKey(defaultComponentKey)} replace />} />
        <Route path="/:componentSlug" element={<DevPage />} />
        <Route path="*" element={<Navigate to={getRoutePathForComponentKey(defaultComponentKey)} replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);