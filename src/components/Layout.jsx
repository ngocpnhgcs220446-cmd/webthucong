import Header from './Header';
import Footer from './Footer';
import FloatingContact from './FloatingContact';

export default function Layout({ children, language, onLanguageChange }) {
  return (
    <>
      <Header language={language} onLanguageChange={onLanguageChange} />
      <main>{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
