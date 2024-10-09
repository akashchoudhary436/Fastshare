import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

import { v4 as uuidv4 } from 'uuid'; // For generating unique room IDs

const socket = io('http://localhost:3001'); // Connect to the server

function P2pSender() {
  const [file, setFile] = useState(null); // Selected file
  const [roomId, setRoomId] = useState(''); // Unique room ID
  const [receiverLink, setReceiverLink] = useState(''); // Receiver URL
  const [fileTransferStarted, setFileTransferStarted] = useState(false); // Prevent multiple transfers
  const [progress, setProgress] = useState(0); // Progress state
  const peerConnection = useRef(null); // RTCPeerConnection instance
  const dataChannelRef = useRef(null); // RTCDataChannel instance

  useEffect(() => {
    // Listen for ICE candidates from Receiver
    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding received ICE candidate', error);
        }
      }
    });

    // Listen for WebRTC answer from Receiver
    socket.on('webrtc-answer', async ({ answer }) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
      }

    });

    return () => {
      socket.off('ice-candidate');
      socket.off('webrtc-answer');
    };
  }, []);


  // Create a room and generate receiver link
  const createRoom = () => {
    const newRoomId = uuidv4(); // Generate unique room ID
    setRoomId(newRoomId);
    setReceiverLink(`http://localhost:3000/receiver/${newRoomId}`); // Generate receiver link
    socket.emit('join-room', newRoomId); // Join the room
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  // Initiate file transfer
  const sendFile = async () => {
    if (!file) return;

    setFileTransferStarted(true);
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };


    // Create DataChannel for file transfer
    dataChannelRef.current = peerConnection.current.createDataChannel('fileTransfer');
    dataChannelRef.current.onopen = () => {
      const CHUNK_SIZE = 16384; // 16KB per chunk
      const reader = new FileReader();
      let offset = 0;

      // Send file metadata
      const metadata = JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
      });
      dataChannelRef.current.send(metadata); // Send metadata first

      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const fileSize = file.size;

        // Send file chunks
        while (offset < fileSize) {
          const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
          dataChannelRef.current.send(chunk);
          offset += CHUNK_SIZE;

          // Update progress bar
          const progress = Math.floor((offset / fileSize) * 100);
          setProgress(progress);
        }

        // Send EOF signal
        dataChannelRef.current.send('EOF');
      };

      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
    };

    // Create WebRTC offer and set local description

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('webrtc-offer', { offer, roomId });
    } catch (error) {
      console.error('Error creating or sending offer:', error);
    }
  };

  return (
    <div>
      <h1>Sender</h1>
      <button onClick={createRoom}>Generate Receiver Link</button>
      {receiverLink && (
        <div>
          <h2>Receiver Link:</h2>
          <a href={receiverLink} target="_blank" rel="noopener noreferrer">
            {receiverLink}
          </a>
        </div>
      )}

      <input type="file" onChange={handleFileSelect} />

      <button onClick={sendFile} disabled={fileTransferStarted}>
        {fileTransferStarted ? 'File Transfer Started' : 'Start File Transfer'}
      </button>
      {fileTransferStarted && (
        <progress value={progress} max="100">
          {progress}%
        </progress>
      )}
    </div>
  );
}

export default P2pSender;