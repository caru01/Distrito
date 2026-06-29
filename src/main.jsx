import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StoreFront from './App.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminCategorias from './pages/AdminCategorias.jsx'
import AdminPedidos from './pages/AdminPedidos.jsx'
import AdminProductos from './pages/AdminProductos.jsx'
import AdminInventario from './pages/AdminInventario.jsx'
import AdminReportes from './pages/AdminReportes.jsx'
import AdminRendimientos from './pages/AdminRendimientos.jsx'
import AdminConfiguracion from './pages/AdminConfiguracion.jsx'
import AdminAnuncios from './pages/AdminAnuncios.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="clientes" element={<div style={{padding:20}}>Vista de Clientes (En construcción)</div>} />
          <Route path="inventario" element={<AdminInventario />} />
          <Route path="reportes" element={<AdminReportes />} />
          <Route path="rendimientos" element={<AdminRendimientos />} />
          <Route path="anuncios" element={<AdminAnuncios />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
