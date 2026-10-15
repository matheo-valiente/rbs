import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Admin from './pages/Admin.jsx';
import MentionsLegales from './pages/MentionsLegales.jsx';
import CGV from './pages/CGV.jsx';
import Confidentialite from './pages/Confidentialite.jsx';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.12 } }
};

const Page = ({ children }) => (
  <motion.main
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ minHeight: '100vh', background: '#fff' }}
  >
    {children}
  </motion.main>
);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/boutique" element={<Page><Shop /></Page>} />
          <Route path="/commande/confirmee" element={<Page><OrderSuccess /></Page>} />
          <Route path="/admin" element={<Page><Admin /></Page>} />
          <Route path="/mentions-legales" element={<Page><MentionsLegales /></Page>} />
          <Route path="/cgv" element={<Page><CGV /></Page>} />
          <Route path="/confidentialite" element={<Page><Confidentialite /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <CartDrawer />
    </>
  );
}
