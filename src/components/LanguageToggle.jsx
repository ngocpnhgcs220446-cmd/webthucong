export default function LanguageToggle({ language, onChange }) {
  return (
    <button className="language-toggle" onClick={() => onChange(language === 'en' ? 'vi' : 'en')} aria-label="Toggle language">
      {language === 'en' ? 'VI' : 'EN'}
    </button>
  );
}
