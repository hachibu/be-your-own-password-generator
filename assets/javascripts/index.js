navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

function recordVideo(videoLength) {
  return new Promise(function(resolve, reject) {
    var mediaData = [];
    var userMediaOptions = {
      audio: true,
      video: true
    };

    navigator.getUserMedia(userMediaOptions, function(stream) {
      var recorder = new MediaRecorder(stream);

      recorder.addEventListener('dataavailable', function(event) {
        mediaData.push(event.data);
      });

      recorder.addEventListener('stop', function() {
        var buffer = new Blob(mediaData);
        var videoSrc = window.URL.createObjectURL(buffer);

        document.getElementById('video').src = videoSrc;
      });

      recorder.start();

      setTimeout(function() {
        recorder.stop();

        setTimeout(function() {
          resolve(mediaData);
        }, 100);
      }, videoLength * 1000);
    }, reject);
  });
}

function randIndex(array) {
  return Math.floor(Math.random() * array.length);
}

function generatePassword() {
  var formData = new FormData(document.getElementById('options'));
  var videoLength = +formData.get('video-length');
  var passwordLength = +formData.get('password-length');
  var charsetPattern = /[a-zA-Z\d#?!@$%^&*-]/;

  console.log({
    'video-length': videoLength,
    'password-length': passwordLength
  });

  return new Promise(function(resolve, reject) {
    recordVideo(videoLength).then(function(mediaData) {
      new Response(mediaData[0]).arrayBuffer().then(function(buff) {
        var password = '';
        var array = new Uint8Array(buff);
        var done = false;

        while (!done) {
          let i = randIndex(array);
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
}

$(document).ready(function() {
  if (!navigator.getUserMedia) {
    alert('This browser does not support the Media Devices API.');
    return;
  }

  var documentElem = $(this);
  var submitElem = $('#submit-button');
  var passwordElem = $('#password');

  submitElem.on('click', function() {
    passwordElem.toggleClass('d-none', true).val('');
    submitElem
      .prop('disabled', true)
      .toggleClass('btn-danger', false)
      .toggleClass('btn-success', true)
      .text('Recording...');

    generatePassword().then(function(password) {
      passwordElem.val(password).toggleClass('d-none', false);
      submitElem
        .prop('disabled', false)
        .toggleClass('btn-danger', true)
        .toggleClass('btn-secondary', false)
        .text('Start Recording');

      documentElem.scrollTop(0);
    }, console.error);
  });
});
