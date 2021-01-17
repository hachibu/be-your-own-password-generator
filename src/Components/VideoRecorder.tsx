import React, { FC, ChangeEvent } from 'react'

interface VideoRecorderProps {
  onRecordingStart: () => void
  onRecordingEnd: (password: string) => void
}

const VideoRecorder: FC<VideoRecorderProps> = (props) => {
  let [isRecording, setRecording] = React.useState(false)
  let [videoLength, setVideoLength] = React.useState(2)
  let [passwordLength, setPasswordLength] = React.useState(32)
  let videoRef = React.useRef<HTMLVideoElement>(null)

  function recordVideo(videoLength: number): Promise<Blob[]> {
    return new Promise((resolve, reject) => {
      let mediaData: Blob[] = []
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          let recorder = new MediaRecorder(stream)
          recorder.addEventListener('dataavailable', (event) => {
            mediaData.push(event.data)
          })
          recorder.addEventListener('stop', () => {
            let buffer = new Blob(mediaData)
            let videoSrc = window.URL.createObjectURL(buffer)
            if (videoRef && videoRef.current) {
              videoRef.current.src = videoSrc
            }
          })
          recorder.start()
          setTimeout(() => {
            recorder.stop()
            setTimeout(() => {
              resolve(mediaData)
            }, 100)
          }, videoLength * 1000)
        })
        .catch(reject)
    });
  }

  function generatePassword(videoLength: number, passwordLength: number): Promise<string> {
    let charsetPattern: RegExp = /[a-zA-Z\d#?!@$%^&*-]/

    return new Promise((resolve, reject) => {
      recordVideo(videoLength).then((mediaData: Blob[]) => {
        new Response(mediaData[0]).arrayBuffer().then(buff => {
          let password = ''
          let array = new Uint8Array(buff)
          let done = false
          while (!done) {
            let i = randIndex(array.length)
            let b = array[i]
            let c = String.fromCharCode(b)
            if (charsetPattern.test(c)) {
              password += c
            }
            done = password.length >= passwordLength
          }
          resolve(password)
        }, reject)
      }, reject)
    })
  }

  function startRecording() {
    setRecording(true)
    props.onRecordingStart()
    generatePassword(videoLength, passwordLength).then(
      (password) => {
        setRecording(false)
        props.onRecordingEnd(password)
      },
      (error) => {
        setRecording(false)
      }
    )
  }

  function handleVideoLengthChange(event: ChangeEvent<HTMLInputElement>){
    let n = parseInt(event.target.value, 10)
    if (!isNaN(n)) {
      setVideoLength(n)
    }
  }

  function handlePasswordLengthChange(event: ChangeEvent<HTMLInputElement>){
    let n = parseInt(event.target.value, 10)
    if (!isNaN(n)) {
      setPasswordLength(n)
    }
  }

  return (
    <form>
      <div className="form-group row mb-2">
        <label className="col-sm-9 col-form-label">
          Video Recording Length
          <small className="text-muted">(seconds)</small>
        </label>
        <div className="col-sm-3">
          <input className="form-control"
                 name="video-length"
                 type="number"
                 min="1"
                 max="30"
                 onChange={handleVideoLengthChange}
                 value={videoLength} />
        </div>
      </div>
      <div className="form-group row mb-4">
        <label className="col-sm-9 col-form-label">Password Length</label>
        <div className="col-sm-3">
          <input className="form-control"
                 name="password-length"
                 type="number"
                 min="1"
                 max="128"
                 onChange={handlePasswordLengthChange}
                 value={passwordLength} />
        </div>
      </div>
      <div className="d-flex justify-content-center mb-4">
        <button id="submit-button"
                type="button"
                className={`text-white w-50 btn ${isRecording ? 'btn-danger' : 'btn-success'}`}
                disabled={isRecording}
                onClick={startRecording}>
          <b>{isRecording ? 'Recording...' : 'Start Recording'}</b>
        </button>
      </div>
      <video controls
             ref={videoRef}
             id="video"
             className="rounded border bg-light w-100 d-block"
             style={{ height: '300px' }}></video>
    </form>
  );
}

function randIndex(length: number): number {
  let min:number = (-length >>> 0) % length
  let randNum = new Uint32Array(1)
  let x: number = 0
  do { x = window.crypto.getRandomValues(randNum)[0] } while (x < min)
  return x % length
}

export default VideoRecorder
