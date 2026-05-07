import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";
import Controls from "./controls";

const VideoRoom = ({ roomId, leaveRoom, showChat, showPeople }) => {
  const APP_ID = "d702f637f7b34bde9607a32f20812a66";
  const TOKEN = null;
  const CHANNEL = roomId;
  const client = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));

  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [hiddenUsers, setHiddenUsers] = useState({});

  const toggleMic = () => {
    localTracks[0].setEnabled(!isMicEnabled);
    setIsMicEnabled(!isMicEnabled);
  };

  const toggleCamera = () => {
    localTracks[1].setEnabled(!isCameraEnabled);
    setIsCameraEnabled(!isCameraEnabled);
  };

  const handleUserJoined = async (user, mediaType) => {
    await client.current.subscribe(user, mediaType);
    if (mediaType === "video") {
      setHiddenUsers((prev) => ({ ...prev, [user.uid]: false }));
      setUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid);
        if (exists) return prev.map((u) => u.uid === user.uid ? user : u);
        return [...prev, user];
      });
    }
    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  };

  const handleUserLeft = (user) => {
    setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    setHiddenUsers((prev) => {
      const updated = { ...prev };
      delete updated[user.uid];
      return updated;
    });
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === "video") {
      setHiddenUsers((prev) => ({ ...prev, [user.uid]: true }));
    }
  };

  useEffect(() => {
    client.current.on("user-published", handleUserJoined);
    client.current.on("user-left", handleUserLeft);
    client.current.on("user-unpublished", handleUserUnpublished);

    client.current
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
      )
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);
        setUsers((prev) => [...prev, { uid, videoTrack, audioTrack }]);
        client.current.publish(tracks);
      });

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.current.off("user-published", handleUserJoined);
      client.current.off("user-left", handleUserLeft);
      client.current.off("user-unpublished", handleUserUnpublished);
      client.current.leave();
    };
  }, []);

  return (
    <>
      <div className="VideoCall flex flex-row space-x-6 absolute top-[14vw] left-[50vw] z-[100]">
        {users.map((user, index) => (
          <div
            key={user.uid}
            style={{
              minWidth: "16vw",
              visibility:
                (index === 0 && !isCameraEnabled) || hiddenUsers[user.uid]
                  ? "hidden"
                  : "visible",
            }}
          >
            <VideoPlayer user={user} isCameraEnabled={isCameraEnabled} />
          </div>
        ))}
      </div>
      <div className="fixed bottom-[0.9vw] right-[25vw]">
        <Controls
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          isMicEnabled={isMicEnabled}
          isCameraEnabled={isCameraEnabled}
          leaveRoom={leaveRoom}
        />
      </div>
    </>
  );
};

export default VideoRoom;