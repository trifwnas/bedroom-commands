import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ToastProvider, ConfirmProvider } from './components/Toast'
import { I18nProvider } from './i18n'
import { useStore } from './store/useStore'

function Root() {
  const language = useStore(s => s.language);
  const setLanguage = useStore(s => s.setLanguage);
  return (
    <I18nProvider lang={language} setLang={setLanguage}>
      <ToastProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)