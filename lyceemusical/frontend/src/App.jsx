import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { useShop } from './context/ShopContext.jsx';
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

// Impossible to miss: a site still on sk_test_ keys takes no real money.
function TestModeBanner() {
  const { shop } = useShop();
  if (!shop?.testMode) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 400,
        background: '#ffd500',
        color: '#000',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.2em',
        padding: '8px 12px'
      }}
    >
      MODE TEST — AUCUN PAIEMENT RÉEL · CARTE 4242 4242 4242 4242
    </div>
  );
}

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
      <TestModeBanner />
    </>
  );
}
