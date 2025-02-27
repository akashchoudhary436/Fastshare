import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('http://localhost:3001');

function P2pSender() {
  const [file, setFile] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [receiverLink, setReceiverLink] = useState('');
  const [fileTransferStarted, setFileTransferStarted] = useState(false);
  const [fileTransferCompleted, setFileTransferCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const peerConnection = useRef(null);
  const dataChannelRef = useRef(null);
  const offsetRef = useRef(0);
  const CHUNK_SIZE = 16384;
  const readerRef = useRef(new FileReader());

  useEffect(() => {
    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerConnection.current && candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding received ICE candidate', error);
        }
      }
    });

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

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      setReceiverLink(`${window.location.origin}/receiver/${newRoomId}`);
      socket.emit('join-room', newRoomId);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receiverLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sendNextChunk = () => {
    if (offsetRef.current < file.size) {
      const chunk = file.slice(offsetRef.current, offsetRef.current + CHUNK_SIZE);
      readerRef.current.readAsArrayBuffer(chunk);
    } else {
      dataChannelRef.current.send('EOF');
      setFileTransferCompleted(true); // Set transfer completed state
    }
  };

  const sendFile = async () => {
    if (!file) return;

    setFileTransferStarted(true);
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, roomId });
      }
    };

    dataChannelRef.current = peerConnection.current.createDataChannel('fileTransfer');
    dataChannelRef.current.onopen = () => {
      const metadata = JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
      });
      dataChannelRef.current.send(metadata);
      dataChannelRef.current.onmessage = (event) => {
        if (event.data === 'ACK') sendNextChunk();
      };
      sendNextChunk();
    };

    readerRef.current.onload = (e) => {
      const arrayBuffer = e.target.result;
      try {
        dataChannelRef.current.send(arrayBuffer);
        offsetRef.current += arrayBuffer.byteLength;
        setProgress(Math.floor((offsetRef.current / file.size) * 100));
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    };

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('webrtc-offer', { offer, roomId });
    } catch (error) {
      console.error('Error creating or sending offer:', error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      animation: 'fadeIn 0.8s ease-in',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.8rem',
      color: '#2c3e50',
      margin: '2rem 0',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.6s ease-out',
    },
    fileSelectContainer: {
      margin: '2rem 0',
      position: 'relative',
    },
    customFileInput: {
      background: 'linear-gradient(45deg, #4caf50, #45a049)',
      color: 'white',
      padding: '1.2rem 2.5rem',
      borderRadius: '30px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      outline: 'none',
      transform: 'scale(1)',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    },
    linkContainer: {
      margin: '2rem 0',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1.5rem',
      background: 'rgba(255,255,255,0.95)',
      padding: '1.2rem 2rem',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      animation: 'slideUp 0.5s ease-out',
    },
    linkText: {
      color: '#2196f3',
      cursor: 'pointer',
      textDecoration: 'none',
      maxWidth: '400px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transition: 'all 0.3s ease',
      '&:hover': {
        color: '#1976d2',
        transform: 'translateX(5px)',
      },
    },
    copyButton: {
      background: 'linear-gradient(45deg, #2196f3, #1976d2)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '0.7rem 1.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(33,150,243,0.3)',
      },
    },
    copiedMessage: {
      position: 'fixed',
      bottom: '30px',
      background: 'linear-gradient(45deg, #4caf50, #45a049)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.4s ease-out, fadeOut 1.5s ease-in 2s forwards',
    },
    sendFileButton: {
      padding: '1.2rem 3rem',
      background: 'linear-gradient(45deg, #ff6b6b, #ff5252)',
      color: 'white',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '1.2rem',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      margin: '2rem 0',
      '&:hover:enabled': {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 25px rgba(255,107,107,0.4)',
      },
      '&:disabled': {
        background: 'linear-gradient(45deg, #cccccc, #aaaaaa)',
        cursor: 'not-allowed',
        opacity: '0.7',
      },
    },
    progressContainer: {
      background: 'rgba(255,255,255,0.95)',
      padding: '1rem',
      borderRadius: '10px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      margin: '1rem auto',
      width: '100%',
      maxWidth: '600px',
      animation: 'fadeIn 0.6s ease-out',
    },
    progressBar: {
      height: '20px',
      borderRadius: '15px',
      background: 'rgba(236, 239, 241, 0.8)',
      overflow: 'hidden',
      position: 'relative',
      margin: '1.5rem 0',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #4caf50, #45a049)',
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
    },
    progressShimmer: {
      position: 'absolute',
      top: '0',
      left: '-100%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: 'shimmer 2s infinite',
    },
    globalAnimations: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes shimmer {
        100% { left: 200%; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,
  };
  return (
    <div style={styles.container}>
      <style>{styles.globalAnimations}</style>
      
      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>🚀 Secure File Transfer</h1>

        <div style={styles.fileSelectContainer}>
          <input 
            type="file" 
            onChange={handleFileSelect} 
            id="fileInput"
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="fileInput" 
            style={styles.customFileInput}
          >
            📁 Select File to Share
          </label>

          {file && (
            <>
              <div style={styles.linkContainer}>
                <span 
                  style={styles.linkText}
                  onClick={copyToClipboard}
                  title="Click to copy"
                >
                  🔗 {receiverLink}
                </span>
                <button 
                  style={styles.copyButton}
                  onClick={copyToClipboard}
                >
                  📋 Copy Link
                </button>
              </div>

              {!fileTransferCompleted && (
                <button 
                  onClick={sendFile} 
                  disabled={fileTransferStarted} 
                  style={{
                    ...styles.sendFileButton,
                    animation: !fileTransferStarted ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  {fileTransferStarted ? '⏳ Transferring...' : '🚀 Start Sharing'}
                </button>
              )}
            </>
          )}

          {fileTransferStarted && (
            <div style={styles.progressContainer}>
              <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>📤 Transfer Progress</h2>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }}>
                  <div style={styles.progressShimmer}></div>
                </div>
              </div>
              <div style={{ fontSize: '1.3rem', color: '#4caf50', fontWeight: '600' }}>
                {progress}% Complete
              </div>
              <p style={{ marginTop: '1rem', color: '#666' }}>
                Transferring: {file.name} ({Math.round(file.size / 1024 / 1024)}MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {isCopied && (
        <div style={styles.copiedMessage}>
          ✅ Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default P2pSender;