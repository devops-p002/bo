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
import VipClub from './pages/VipClub';
import ComingSoon from './pages/ComingSoon';

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
                  <Route path="/vip-club" element={<VipClub />} />
                  {/* No fishing/arcade/lottery/sportsbook/promotions/RG/support
                      backend exists yet - honest placeholders rather than
                      fabricated content, per CLAUDE.md. */}
                  <Route path="/fishing" element={<ComingSoon title="Fishing" />} />
                  <Route path="/arcade" element={<ComingSoon title="Arcade" />} />
                  <Route path="/lottery" element={<ComingSoon title="Lottery" />} />
                  <Route path="/sports" element={<ComingSoon title="Sports" />} />
                  <Route path="/promotions" element={<ComingSoon title="Promotion" />} />
                  <Route path="/responsible-gaming" element={<ComingSoon title="Responsible Gaming" />} />
                  <Route path="/support" element={<ComingSoon title="Live Support" />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
