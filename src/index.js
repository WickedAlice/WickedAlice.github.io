import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById("serendipity-banner"));

/* get uer parameters */
const scripts = document.getElementsByTagName('script');
const lastScript = scripts[scripts.length - 1];
const id = lastScript.getAttribute('id');
const lang = lastScript.getAttribute('lang') || navigator.language;
const layout = lastScript.getAttribute('layout');

root.render(
  <React.StrictMode>
    <App id={id} lang={lang} layout={layout}/>
  </React.StrictMode>
);

reportWebVitals();
