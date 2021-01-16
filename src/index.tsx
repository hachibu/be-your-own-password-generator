import React from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.css'

import App from './App'

if (!navigator?.mediaDevices?.getUserMedia) {
  alert('This browser does not support the Media Devices API.')
} else if (!crypto) {
  alert('This browser does not support the Web Crypto API.')
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}
