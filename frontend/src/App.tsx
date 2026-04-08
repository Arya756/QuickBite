import React from 'react';
import { Navbar, Footer } from './components/Navigation';
import { Home } from './pages/Home';
import { RestaurantList } from './pages/RestaurantList';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { Cart } from './pages/Cart';
import { OrderTracking } from './pages/OrderTracking';
import { Routes, Route } from 'react-router-dom';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  return (
    <div className="min-h-screen flex flex-col pt-2">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
