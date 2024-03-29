const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
      {
        urls: "turn:standard.relay.metered.ca:80",
        username: "1d58dc82e6799dde31d6723d",
        credential: "e6+poNAQkZ9m/22y",
      }
    ],
    maxConnections: 10
  }
});
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
})

window.addEventListener('beforeunload', () => {
  // Notify the server that the user is disconnecting
  socket.emit('disconnecting', ROOM_ID, myPeer.id);
});

// ...

socket.on('disconnecting', (roomId, userId) => {
  // Handle the user disconnecting event from the server
  socket.to(roomId).emit('user-disconnected', userId);
  const videoElement = document.getElementById(userId); // Get the video element
  if (videoElement) {
    videoElement.remove(); // Remove the video element from the DOM
  }
  if (peers[userId]) {
    peers[userId].close(); // Close the peer connection
    delete peers[userId]; // Remove the peer connection from the peers object
  }
});


socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close(); // Close the peer connection
    const videoElement = document.getElementById(userId);
    if (videoElement) {
      videoElement.remove(); // Remove the video element from the DOM
    }
    delete peers[userId]; // Remove the peer connection from the peers object
  }
});






myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  video.id = userId;
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
const leaveMeetingBtn = document.querySelector('.leave_meeting');

leaveMeetingBtn.addEventListener('click', () => {
  socket.disconnect();
  window.location.href = '/kaka';
})
