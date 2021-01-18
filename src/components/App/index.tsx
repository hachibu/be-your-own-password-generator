import React, { FC } from 'react'
import { connect, useSelector } from 'react-redux'
import { IAppState, startRecording, endRecording } from './appSlice'
import Details from '../Details'
import VideoRecorder from '../VideoRecorder'
import './App.css'

interface IAppProps {
  startRecording: () => void
  endRecording: (password: string) => void
}

const App: FC<IAppProps> = ({ startRecording, endRecording }) => {
  let password = useSelector((state: IAppState) => state.password)
  let showPassword = useSelector((state: IAppState) => state.showPassword)
  let details = [
    {
      title: 'What is this?',
      description: <span>
        This is an experimental password generator written in ReactJS that uses a video of you to
        generate a random password. You can find more details on my <a className="text-white font-weight-bold"
                                                                       style={{textDecoration: 'underline'}}
                                                                       href="https://hachibu.net/posts/2019/be-your-own-password-generator/"
                                                                       rel="noreferrer"
                                                                       target="_blank">blog</a>.
      </span>,
      open: true
    },
    {
      title: 'How does this work?',
      description: <span>
        It records a short video of you and then transforms that raw video
        data into an array of 8-bit unsigned integers. Then it randomly
        selects an integer from that array and transforms it into its
        corresponding UTF-16 character. If that character is a lowercase
        letter, uppercase letter, digit or special character it will be used
        for your password. The process of selecting a random character
        continues until the password is long enough.
      </span>,
      open: false
    },
    {
      title: 'Is the video saved anywhere?',
      description: <span>
        The video is only stored temporarily in your browser for playback
        purposes. The video will dissapear as soon as you close or refresh
        this page.
      </span>,
      open: false
    },
    {
      title: 'Is it safe to use these passwords?',
      description: <span>
        I would strongly suggest that you do not use these passwords.
        I haven't run any proper entropy tests on the generated passwords.
        So, I can't confirm or deny the actual strength of these passwords.
        Please keep using your password manager to generate passwords.
      </span>,
      open: false
    },
  ];

  return (
    <div className="container">
      <div className="row mb-4 pl-3 pr-3">
        <input name="password"
               defaultValue={password}
               className={`w-100 p-4 alert alert-success form-control ${showPassword ? 'd-block': 'd-none'}`}
               type="text"
               style={{fontSize: '30px'}} />
      </div>

      <div className="row">
        <div className="col mb-4">
          <div className="text-white mb-4 h-100">
            <h1 className="mb-5">Be Your Own Password Generator</h1>
            {details.map((detail, i) => (
              <Details key={i}
                       index={i}
                       open={detail.open}
                       title={detail.title}
                       description={detail.description} />
            ))}
          </div>
        </div>

        <div className="col">
          <div className="bg-white rounded p-4 mb-4">
            <VideoRecorder onRecordingStart={startRecording}
                           onRecordingEnd={endRecording} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect(null, { startRecording, endRecording })(App)
