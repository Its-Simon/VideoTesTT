document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

    const APP_ID = "e7fa4f9cf0074bc78b5c416ce71b13a5";
    const TOKEN = "007eJxTYDg0a9KPJd1x5feaDwlVrsjl8Cn8NP03g2DJ+X8rfdQ2v7mgwJBqnpZokmaZnGZgYG6SlGxukWSabGJolpxqbphkaJxoepqdPa0hkJEh5ctHFkYGCATx2RkKcqrK84uyGRgAhMUjhg==";
    const CHANNEL_NAME = "plzwork";

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log("AgoraRTC client created successfully");

    let localTracks = [];
    let remoteUsers = {};

    let joinAndDisplayLocalStream = async () => {
        client.on('user-published', handleUserJoined);
        client.on('user-left', handleUserLeft);

        let UID = await client.join(APP_ID, CHANNEL_NAME, TOKEN, null);

        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

        let player = `<div class="video-container" id="user-container-${UID}">
                            <div class="video-player" id="user-${UID}"></div>
                      </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        localTracks[1].play(`user-${UID}`);

        await client.publish([localTracks[0], localTracks[1]]);
    };

    let joinStream = async () => {
        await joinAndDisplayLocalStream();
        document.getElementById('join-btn').style.display = 'none';
        document.getElementById('stream-controls').style.display = 'flex';
    };

    let handleUserJoined = async (user, mediaType) => {
        remoteUsers[user.uid] = user;
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
            let player = document.getElementById(`user-container-${user.uid}`);
            if (player != null) {
                player.remove();
            }

            player = `<div class="video-container" id="user-container-${user.uid}">
                            <div class="video-player" id="user-${user.uid}"></div> 
                     </div>`;
            document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

            user.videoTrack.play(`user-${user.uid}`);
        }

        if (mediaType === 'audio') {
            user.audioTrack.play();
        }
    };

    let handleUserLeft = async (user) => {
        delete remoteUsers[user.uid];
        document.getElementById(`user-container-${user.uid}`).remove();
    };

    let leaveAndRemoveLocalStream = async () => {
        for (let i = 0; localTracks.length > i; i++) {
            localTracks[i].stop();
            localTracks[i].close();
        }

        await client.leave();
        document.getElementById('join-btn').style.display = 'block';
        document.getElementById('stream-controls').style.display = 'none';
        document.getElementById('video-streams').innerHTML = '';
    };

    let toggleMic = async (e) => {
        if (localTracks[0].muted) {
            await localTracks[0].setMuted(false);
            e.target.innerText = 'Mic on';
            e.target.style.backgroundColor = 'cadetblue';
        } else {
            await localTracks[0].setMuted(true);
            e.target.innerText = 'Mic off';
            e.target.style.backgroundColor = '#EE4B2B';
        }
    };

    let toggleCamera = async (e) => {
        if (localTracks[1].muted) {
            await localTracks[1].setMuted(false);
            e.target.innerText = 'Camera on';
            e.target.style.backgroundColor = 'cadetblue';
        } else {
            await localTracks[1].setMuted(true);
            e.target.innerText = 'Camera off';
            e.target.style.backgroundColor = '#EE4B2B';
        }
    };

    document.getElementById('join-btn').addEventListener('click', joinStream);
    document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
    document.getElementById('mic-btn').addEventListener('click', toggleMic);
    document.getElementById('camera-btn').addEventListener('click', toggleCamera);

    console.log("Event listeners added successfully");
});
