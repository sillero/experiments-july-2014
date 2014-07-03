(function(window, document, $, ColorThief, getUserMedia, SonicServer, SonicSocket){
  
  /*
    Detects the main color on the environment visible by the camera
    and change the ring's background color
   */
  
  var $centerPiece = $('#center-piece');
  var $userMedia = $('#user-media');
  var video = $userMedia.find('video')[0];
  var canvas = $userMedia.find('canvas')[0];
  var streaming = false;
  var width = 320;
  var height = 0;
  var colorThief = new ColorThief();

  getUserMedia({
    video: true,
    audio: false
  }, function(err, stream) {
    if (navigator.mozGetUserMedia) {
      video.mozSrcObject = stream;
    } else {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL.createObjectURL(stream);
    }
    video.play();
  });

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true; 
      takePicture();
      setInterval(takePicture, 2000);
    }
  }, false);

  function takePicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    
    var mainColor = colorThief.getColor(canvas);
    var use_black;
    var secondaryColor;
    var gamma = 2.2;
    var L = 0.2126 * Math.pow(mainColor[0]/255, gamma) + 0.7152 * Math.pow(mainColor[1]/255, gamma) + 0.0722 * Math.pow(mainColor[2]/255, gamma);
    L = L.toFixed(2);

    //   if (L >= 0.6 ) {
    //     secondaryColor = [0,0,0];
    //     document.body.style.textShadow = 'none';
    //   }
    //   else if (L < 0.4) {
    //     secondaryColor = [255,255,255];
    //     document.body.style.textShadow = 'none';
    //   }
    //   else {
    //     secondaryColor = [255,255,255];
    //     document.body.style.textShadow = '0 0 3px rgba(0, 0, 0, 0.6)';
    //   }
    // console.log(L);
    
    if (L < 0.35) {
      secondaryColor = [255,255,255];
    }
    else {
      secondaryColor = [0,0,0];
    }

    $centerPiece.css({ backgroundColor: 'rgb(' + mainColor.join(',') + ')' });
    // document.body.style.color = 'rgb(' + secondaryColor.join(',') + ')';
  }
  
  /*
    Ultrasonic commands
   */
  
  
  // Calculate the alphabet based on the emoticons.
  var sonicSocket;
  var sonicServer;
  var toggleCenterPiece = $('#toggle-center-piece')[0];

  createSonicNetwork();
  bindCommands();

  function createSonicNetwork() {
    // Stop the sonic server if it is listening.
    if (sonicServer) {
      sonicServer.stop();
    }
    var coder = new SonicCoder({
      freqMin: 18500,
      freqMax: 19500
    });
    sonicServer = new SonicServer({alphabet: '01', debug: false, coder: coder});
    sonicSocket = new SonicSocket({alphabet: '01', coder: coder });

    sonicServer.start();
    sonicServer.on('message', onIncomingCommand);
  }

  function sendCommand(e) {
    sonicSocket.send(this.dataset.command);
  }

  function bindCommands(list) {
    $('[data-command]').on('touchend', sendCommand);
  }

  function onIncomingCommand(message) {
    if (message === '0') {
      toggleCenterPiece.checked = true;
    }
    if (message === '1') {
      toggleCenterPiece.checked = false;
    }
  }
  
})(window, document, Zepto, ColorThief, getUserMedia, SonicServer, SonicSocket);


