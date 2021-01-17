import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'
import App from './Components/App'
import appStore from './Components/App/store'
import { Provider } from 'react-redux'

if (!navigator?.mediaDevices?.getUserMedia) {
  alert('This browser does not support the Media Devices API.')
} else if (!window.MediaRecorder) {
  alert('This browser does not support the Media Recorder API.')
} else if (!crypto) {
  alert('This browser does not support the Web Crypto API.')
} else {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={appStore}>
        <App />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}
