// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import platform from 'platform';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [sessionId, setSessionId] = useState('');
  const [inputSessionId, setInputSessionId] = useState('');
  const [message, setMessage] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(platform.description || '');
  const [stream, setStream] = useState(null);
  const videoRef = useRef();

  const createSession = () => {
    socket.emit('createSession');
  };

  const joinSession = () => {
    socket.emit('joinSession', { sessionId: inputSessionId, deviceInfo });
  };

  const startSharing = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setStream(screenStream);
      videoRef.current.srcObject = screenStream;

      screenStream.getTracks().forEach(track => {
        track.onended = () => {
          setStream(null);
          videoRef.current.srcObject = null;
        };
      });
    } else {
      alert('Your browser does not support screen sharing.');
    }
  };

  socket.on('sessionCreated', (id) => {
    setSessionId(id);
    setMessage(`Session created with ID: ${id}`);
  });

  socket.on('joinSuccess', ({ id, sessionId, deviceInfo }) => {
    setMessage(`Successfully joined session: ${sessionId}`);
  });

  socket.on('joinError', (error) => {
    setMessage(`Error: ${error}`);
  });

  socket.on('joinRequest', ({ id, sessionId, deviceInfo }) => {
    setMessage(`Device Info: ${deviceInfo}`);
  });

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">Remote Control</h1>
      <button onClick={createSession} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Create Session
      </button>
      {sessionId && <p>Session ID: {sessionId}</p>}
      <input
        type="text"
        placeholder="Enter Session ID"
        value={inputSessionId}
        onChange={(e) => setInputSessionId(e.target.value)}
        className="border rounded py-2 px-3 text-gray-700"
      />
      <button onClick={joinSession} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Join Session
      </button>
      {message && <p>{message}</p>}
      <button onClick={startSharing} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Share Screen
      </button>
      <video ref={videoRef} autoPlay style={{ width: '100%', marginTop: '20px' }}></video>
    </div>
  );
}

export default App;
