import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App'
import appStore from './components/App/appStore'
import { Provider } from 'react-redux'

appStore.subscribe(() => console.log('appStore state:', appStore.getState()))

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
