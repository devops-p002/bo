import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './components/AuthLayout';
import Layout from './components/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import GameDetail from './pages/GameDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login/Register are standalone full-screen pages, deliberately
              not nested inside the sidebar/header Layout below (a real
              casino site's own auth screens don't show its lobby nav
              around the form). AuthLayout is a layout route here (renders
              an <Outlet/>) rather than something each page wraps itself
              in, so it - and its <video> elements - stays mounted while
              navigating between the two, instead of unmounting/
              remounting (and the video visibly flickering/restarting)
              every time. */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/games/:gameId" element={<GameDetail />} />
                  <Route
                    path="/wallet"
                    element={
                      <ProtectedRoute>
                        <Wallet />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
