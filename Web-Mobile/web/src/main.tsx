import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@radix-ui/themes/styles.css";
import './index.css'
import './global.css'
import App from './App.tsx'
import { Theme } from '@radix-ui/themes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme accentColor="orange" grayColor="sand" radius="large" scaling="95%" appearance="dark" >
              <App />
    </Theme>
  </StrictMode>,
)
