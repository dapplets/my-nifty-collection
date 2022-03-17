import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.min.css';
import { IDappState } from './types';
import App from './App';
import { dappletState } from '@dapplets/dapplet-overlay-bridge';

const DappletState = dappletState<IDappState>(App);

ReactDOM.render(
  // <React.StrictMode>
  <DappletState />,
  //</React.StrictMode>,
  document.getElementById('root'),
);
