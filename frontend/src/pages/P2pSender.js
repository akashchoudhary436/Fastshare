import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('http://localhost:3001');

function P2pSender() {
  const [files, setFiles] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [receiverLink, setReceiverLink] = useState('');
  const [fileTransferStarted, setFileTransferStarted] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [progress, setProgress] = useState(0);
  const peerConnection = useRef(null);
  const dataChannelRef = useRef(null);
  
  const CHUNK_SIZE = 16384; // Size of each chunk
  const BUFFER_THRESHOLD = 65536; // Buffer threshold

  useEffect(() => {
    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    return () => {
      socket.off('ice-candidate');
      socket.off('webrtc-answer');
    };
  }, []);

  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setReceiverLink(`http://localhost:3000/receiver/${newRoomId}`);
    socket.emit('join-room', newRoomId);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files).map(file => ({
      file,
      relativePath: file.webkitRelativePath || file.name
    }));

    // Capture the folder name (if available)
    const folderPath = selectedFiles[0].relativePath.split('/')[0];
    setFolderName(folderPath);

    setFiles(selectedFiles);
  };

  const sendFile = async () => {
    if (files.length === 0) return;

    setFileTransferStarted(true);
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    dataChannelRef.current = peerConnection.current.createDataChannel('fileTransfer');
    dataChannelRef.current.binaryType = 'arraybuffer';

    dataChannelRef.current.onopen = () => {
      // Send folder name first
      dataChannelRef.current.send(JSON.stringify({ folderName }));

      files.forEach(({ file, relativePath }) => {
        const metadata = JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          relativePath,
        });

        dataChannelRef.current.send(metadata);

        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target.result;
          let offset = 0;

          const sendChunk = () => {
            while (offset < arrayBuffer.byteLength) {
              if (dataChannelRef.current.bufferedAmount > BUFFER_THRESHOLD) {
                dataChannelRef.current.onbufferedamountlow = sendChunk;
                return;
              }

              const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
              dataChannelRef.current.send(chunk);
              offset += CHUNK_SIZE;
              setProgress(Math.floor((offset / file.size) * 100));
            }

            if (offset >= arrayBuffer.byteLength) {
              dataChannelRef.current.send('EOF');
            }
          };

          sendChunk();
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
        };

        reader.readAsArrayBuffer(file);
      });
    };

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
      <input type="file" onChange={handleFileSelect} multiple webkitdirectory="true" />
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