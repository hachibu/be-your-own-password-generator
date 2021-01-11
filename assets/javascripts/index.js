class App extends React.Component {
  state = {
    details: [
      {
        title: 'What is this?',
        description: <span>
          This is an experimental password generator written in ReactJS that uses a video of you to
          generate a random password. You can find more details on my <a className="text-white font-weight-bold"
                                                                         style={{textDecoration: 'underline'}}
                                                                         href="https://hachibu.net/posts/2019/be-your-own-password-generator/"
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
    ],
    password: '',
    showPassword: false
  }

  constructor(props) {
    super(props)
  }

  handleRecordingStart = () => {
    this.setState({ ...this.state, showPassword: false });
  }

  handleRecordingEnd = (password) => {
    this.setState({ ...this.state, password, showPassword: true });
  }

  render() {
    return (
      <div className="container">
        <div className="row mb-4 pl-3 pr-3">
          <input id="password"
                 defaultValue={this.state.password}
                 className={`w-100 p-4 alert alert-success form-control ${this.state.showPassword ? 'd-block': 'd-none'}`}
                 type="text"
                 style={{fontSize: '30px'}} />
        </div>

        <div className="row">
          <div className="col mb-4">
            <div className="text-white mb-4 h-100">
              <h1 className="mb-5">
                Be Your Own Password Generator
              </h1>
              <DetailsComponent details={this.state.details} />
            </div>
          </div>

          <div className="col">
            <div className="bg-white rounded p-4 mb-4">
              <VideoRecordingComponent onRecordingStart={this.handleRecordingStart}
                                       onRecordingEnd={this.handleRecordingEnd} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function DetailsComponent(props) {
  return (
    <div>
      {props.details.map((detail, i) => (
        <details key={i} open={detail.open} className={i > 0 ? 'mb-4' : ''}>
          <summary>
            <b>{detail.title}</b>
          </summary>
          <p className="text-light">
            {detail.description}
          </p>
        </details>
      ))}
    </div>
  );
}

function VideoRecordingComponent(props) {
  const recordVideo = (videoLength) => {
    return new Promise((resolve, reject) => {
      var mediaData = [];
      var userMediaOptions = {
        audio: true,
        video: true
      };
      navigator.getUserMedia(userMediaOptions, (stream) => {
        var recorder = new MediaRecorder(stream);
        recorder.addEventListener('dataavailable', (event) => {
          mediaData.push(event.data);
        });
        recorder.addEventListener('stop', () => {
          var buffer = new Blob(mediaData);
          var videoSrc = window.URL.createObjectURL(buffer);
          document.getElementById('video').src = videoSrc;
        });
        recorder.start();
        setTimeout(() => {
          recorder.stop();
          setTimeout(() => {
            resolve(mediaData);
          }, 100);
        }, videoLength * 1000);
      }, reject);
    });
  };

  const randIndex = (length) => {
    // modulo with discard method
    let min = (-length >>> 0) % length;
    let randNum = new Uint32Array(1);
    let x;
    do {
      x = window.crypto.getRandomValues(randNum);
    } while (x < min);
    return x % length;
  };

  const generatePassword = () => {
    var formData = new FormData(document.getElementById('options'));
    var videoLength = +formData.get('video-length');
    var passwordLength = +formData.get('password-length');
    var charsetPattern = /[a-zA-Z\d#?!@$%^&*-]/;
    return new Promise((resolve, reject) => {
      recordVideo(videoLength).then(mediaData => {
        new Response(mediaData[0]).arrayBuffer().then(buff => {
          var password = '';
          var array = new Uint8Array(buff);
          var done = false;
          while (!done) {
            let i = randIndex(array.length);
            let b = array[i];
            let c = String.fromCharCode(b);
            if (charsetPattern.test(c)) {
              password += c;
            }
            done = password.length >= passwordLength;
          }
          resolve(password);
        }, reject);
      }, reject);
    });
  };

  const [isRecording, setRecording] = React.useState(false);
  const startRecording = () => {
    setRecording(true);
    props.onRecordingStart(password);
    generatePassword().then(password => {
      setRecording(false);
      props.onRecordingEnd(password);
    }, alert);
  };

  return (
    <form id="options">
      <div className="form-group row mb-2">
        <label className="col-sm-9 col-form-label">
          Video Recording Length
          <small className="text-muted">(seconds)</small>
        </label>
        <div className="col-sm-3">
          <input readOnly className="form-control" name="video-length" type="number" min="1" max="30" value="2" />
        </div>
      </div>
      <div className="form-group row mb-4">
        <label className="col-sm-9 col-form-label">Password Length</label>
        <div className="col-sm-3">
          <input readOnly className="form-control" name="password-length" type="number" min="1" max="128" value="32" />
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
             id="video"
             className="rounded border bg-light w-100 d-block"
             style={{ height: '300px' }}></video>
    </form>
  );
}

if (!navigator.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else if (!window.crypto) {
  alert('This browser does not support the Web Crypto API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
