import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid'; // For generating unique room IDs

const socket = io('http://localhost:3001'); // Connect to the server
const NUMBER_OF_CHANNELS = 4; // Number of data channels to create

function P2pSender() {
  const [file, setFile] = useState(null); // Selected file
  const [roomId, setRoomId] = useState(''); // Unique room ID
  const [receiverLink, setReceiverLink] = useState(''); // Receiver URL
  const [fileTransferStarted, setFileTransferStarted] = useState(false); // Prevent multiple transfers
  const [progress, setProgress] = useState(0); // Progress state
  const peerConnection = useRef(null); // RTCPeerConnection instance
  const dataChannels = useRef([]); // Array of RTCDataChannel instances
  const totalChunks = useRef(0); // Total number of chunks
  const chunksSent = useRef(0); // Number of chunks sent
  const pendingChunks = useRef([]); // Chunks to be sent
  const channelIndex = useRef(0); // Current channel index for sending

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

    // Create multiple DataChannels for file transfer
    for (let i = 0; i < NUMBER_OF_CHANNELS; i++) {
      const dataChannel = peerConnection.current.createDataChannel(`fileTransfer${i}`);
      dataChannels.current.push(dataChannel);

      dataChannel.onopen = () => {
        console.log(`Data channel ${i} is open, ready to send file`);
        if (i === 0) {
          // Start sending file chunks when the first channel is open
          sendFileChunks();
        }
      };

      dataChannel.onmessage = (event) => {
        if (event.data === 'ACK') {
          // Acknowledgment received, send the next chunk
          sendNextChunk();
        }
      };
    }

    // Create WebRTC offer and set local description
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('webrtc-offer', { offer, roomId });
    } catch (error) {
      console.error('Error creating or sending offer:', error);
    }
  };

  const sendFileChunks = () => {
    const CHUNK_SIZE = 16384; // 16KB per chunk
    const reader = new FileReader();
    let offset = 0; // Offset for reading
    totalChunks.current = Math.ceil(file.size / CHUNK_SIZE); // Calculate total number of chunks

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;

      // Fill pendingChunks with all chunks
      while (offset < arrayBuffer.byteLength) {
        const chunk = arrayBuffer.slice(offset, Math.min(offset + CHUNK_SIZE, arrayBuffer.byteLength));
        pendingChunks.current.push(chunk);
        offset += CHUNK_SIZE;
      }

      // Start sending the first chunk
      sendNextChunk();
    };

    reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
  };

  const sendNextChunk = () => {
    if (pendingChunks.current.length === 0) {
      // If all chunks have been sent, send EOF signal on the last channel
      const lastChannel = dataChannels.current[channelIndex.current];
      lastChannel.send('EOF');
      return;
    }

    const chunk = pendingChunks.current.shift(); // Get the next chunk
    const currentChannel = dataChannels.current[channelIndex.current];

    currentChannel.send(chunk); // Send the chunk
    console.log(`Sending chunk to channel ${channelIndex.current}`);

    // Update progress
    chunksSent.current++;
    const progress = Math.floor((chunksSent.current / totalChunks.current) * 100);
    setProgress(progress);

    // Move to the next channel in round-robin fashion
    channelIndex.current = (channelIndex.current + 1) % NUMBER_OF_CHANNELS;
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
