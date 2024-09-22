import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:3001'); // Connect to the server

function P2pReceiver() {
  const { roomId } = useParams(); // Extract roomId from URL
  const [receivedFile, setReceivedFile] = useState(null); // Received file state
  const [progress, setProgress] = useState(0); // Progress state
  const peerConnection = useRef(null); // RTCPeerConnection instance
  const receivedChunks = useRef([]); // Array to store file chunks
  const [fileReceived, setFileReceived] = useState(false); // To indicate file reception
  const totalReceived = useRef(0); // Use useRef for totalReceived

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection();

    // Handle incoming data channels
    peerConnection.current.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      let fileSize;
      let fileName;

      receiveChannel.onopen = () => {
        console.log('Data channel is open, ready to receive file');
      };

      receiveChannel.onmessage = (event) => {
        if (typeof event.data === 'string') {
          // Handle metadata first
          try {
            const metadata = JSON.parse(event.data);
            if (metadata.fileName && metadata.fileSize) {
              fileName = metadata.fileName; // Set the received file name
              fileSize = metadata.fileSize; // Set the file size
              console.log(`Receiving file: ${fileName}, Size: ${fileSize}`);
            }
          } catch (error) {
            if (event.data === 'EOF') {
              console.log('End of file transfer');
              const blob = new Blob(receivedChunks.current); // Reassemble file from chunks
              const fileUrl = URL.createObjectURL(blob);
              setReceivedFile({ fileName, fileUrl });
              setFileReceived(true);
            }
          }
        } else if (event.data instanceof ArrayBuffer) {
          receivedChunks.current.push(event.data);
          totalReceived.current += event.data.byteLength; // Update ref for totalReceived
      
          // Update progress bar
          const progress = Math.floor((totalReceived.current / fileSize) * 100);
          setProgress(progress);
        }
      };

      receiveChannel.onclose = () => {
        console.log('Data channel is closed');
      };
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    if (roomId) {
      socket.emit('join-room', roomId);
    }

    socket.on('webrtc-offer', async ({ offer }) => {
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('webrtc-answer', { answer, roomId });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate', error);
      }
    });

    return () => {
      peerConnection.current.close();
      socket.off('webrtc-offer');
      socket.off('ice-candidate');
    };
  }, [roomId]);

  return (
    <div>
      <h1>Receiver</h1>
      {fileReceived ? (
        <div>
          <h2>Received File</h2>
          <a href={receivedFile.fileUrl} download={receivedFile.fileName}>
            Download File
          </a>
        </div>
      ) : (
        <progress value={progress} max="100">{progress}%</progress>
      )}
    </div>
  );
}

export default P2pReceiver;