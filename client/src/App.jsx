import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Store from './pages/Store.jsx';
import StoreSuccess from './pages/StoreSuccess.jsx';
import TicketOffice from './pages/TicketOffice.jsx';
import TicketSuccess from './pages/TicketSuccess.jsx';
import Music from './pages/Music.jsx';
import Live from './pages/Live.jsx';
import Contact from './pages/Contact.jsx';
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
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/store" element={<Page><Store /></Page>} />
          <Route path="/store/success" element={<Page><StoreSuccess /></Page>} />
          <Route path="/ticket-office" element={<Page><TicketOffice /></Page>} />
          <Route path="/tickets/success" element={<Page><TicketSuccess /></Page>} />
          <Route path="/music" element={<Page><Music /></Page>} />
          <Route path="/live" element={<Page><Live /></Page>} />
          <Route path="/contact" element={<Page><Contact /></Page>} />
          <Route path="/mentions-legales" element={<Page><MentionsLegales /></Page>} />
          <Route path="/cgv" element={<Page><CGV /></Page>} />
          <Route path="/confidentialite" element={<Page><Confidentialite /></Page>} />
          <Route path="*" element={<Page><Home /></Page>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
