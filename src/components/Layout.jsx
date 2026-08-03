import Header from './Header';
import Footer from './Footer';
import FloatingContact from './FloatingContact';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
