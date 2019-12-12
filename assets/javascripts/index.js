function supportsCrypto() {
  return window.crypto && crypto.subtle && window.TextEncoder;
}

function hex(buff) {
  return [].map.call(new Uint8Array(buff), b => ('00' + b.toString(16)).slice(-2)).join('');
}

function hash(algo, str) {
  return crypto.subtle.digest(algo, new TextEncoder().encode(str));
}

if (!supportsCrypto()) {
  alert('This browser does not suport the Web Crypto API.');
}
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

if (!navigator.getUserMedia) {
  alert('This browser does not suport the User Media API.');
}

$(document).on('keydown', function(e) {
  $('#keys').append(e.key);
});

function record(done) {
  var mediaData = [];

  navigator.getUserMedia(
    { audio: true, video: true },
    function(stream) {
      var recorder = new MediaRecorder(stream);

      recorder.addEventListener('dataavailable', function(event) {
        mediaData.push(event.data);
      });

      recorder.addEventListener('stop', function() {
        var buffer = new Blob(mediaData);
        document.getElementById('video').src =
          window.URL.createObjectURL(buffer);
      });

      recorder.start();

      setTimeout(function() {
        recorder.stop();
        setTimeout(function() {
          done(mediaData);
        }, 500);
      }, 5000);
    },
    alert
  );
}

function generatePassword(done) {
  var formElement = document.getElementById('options');
  var formData = new FormData(formElement);
  var passwordLength = formData.get('password-length');
  var p = /[a-zA-Z\d#?!@$%^&*-]/;

  record(function(mediaData) {
    new Response(mediaData[0]).arrayBuffer().then(function(buff) {
      var s = '';
      var byteOffset = Math.pow(2, 10);
      var array = (new Uint8Array(buff)).slice(byteOffset);

      _.each(array, function(b) {
        let c = String.fromCharCode(b);
        if (p.test(c)) {
          s += c;
        }
        if (s.length >= passwordLength) {
          return false;
        }
      });

      done(s);
    });
  });
}

$('#submit-button').on('click', function() {
  var submitButtonElement = $(this);
  var passwordElement = $('#password');

  passwordElement.toggleClass('d-none', true).val('');
  submitButtonElement.prop('disabled', true);

  generatePassword(function(password) {
    passwordElement.val(password).toggleClass('d-none', false);
    submitButtonElement.prop('disabled', false);
  });
});
