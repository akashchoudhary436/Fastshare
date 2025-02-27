import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:3001');

function P2pReceiver() {
  const { roomId } = useParams();
  const [receivedFile, setReceivedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const peerConnection = useRef(null);
  const receivedChunks = useRef([]);
  const [fileReceived, setFileReceived] = useState(false);
  const totalReceived = useRef(0);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      let fileSize, fileName;

      receiveChannel.onopen = () => console.log('Data channel open');
      
      receiveChannel.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const metadata = JSON.parse(event.data);
            if (metadata.fileName && metadata.fileSize) {
              fileName = metadata.fileName;
              fileSize = metadata.fileSize;
            }
          } catch {
            if (event.data === 'EOF') {
              const blob = new Blob(receivedChunks.current);
              setReceivedFile({ 
                fileName, 
                fileUrl: URL.createObjectURL(blob) 
              });
              setFileReceived(true);
            }
          }
        } else if (event.data instanceof ArrayBuffer) {
          receivedChunks.current.push(event.data);
          totalReceived.current += event.data.byteLength;
          setProgress(Math.floor((totalReceived.current / fileSize) * 100));
          receiveChannel.send('ACK');
        }
      };
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) socket.emit('ice-candidate', { candidate: event.candidate, roomId });
    };

    if (roomId) socket.emit('join-room', roomId);

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
        console.error('Error adding ICE candidate:', error);
      }
    });

    return () => {
      peerConnection.current.close();
      socket.off('webrtc-offer');
      socket.off('ice-candidate');
    };
  }, [roomId]);

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
    fileReceivedContainer: {
      background: 'rgba(255,255,255,0.95)',
      padding: '2rem',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      animation: 'fadeIn 0.6s ease-out',
      textAlign: 'center',
    },
    downloadButton: {
      background: 'linear-gradient(45deg, #4caf50, #45a049)',
      color: 'white',
      padding: '1.2rem 2.5rem',
      borderRadius: '30px',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
      },
      '&:active': {
        transform: 'scale(0.98)',
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
      @keyframes shimmer {
        100% { left: 200%; }
      }
    `,
  };

  return (
    <div style={styles.container}>
      <style>{styles.globalAnimations}</style>
      
      <div style={styles.contentWrapper}>
        <h1 style={styles.title}>📥 Secure File Receiver</h1>

        {fileReceived ? (
          <div style={styles.fileReceivedContainer}>
            <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>🎉 Transfer Complete!</h2>
            <a
              href={receivedFile.fileUrl}
              download={receivedFile.fileName}
              style={styles.downloadButton}
            >
              ⬇️ Download {receivedFile.fileName}
            </a>
          </div>
        ) : (
          <div style={styles.progressContainer}>
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>📥 Receiving File...</h2>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }}>
                <div style={styles.progressShimmer}></div>
              </div>
            </div>
            <div style={{ fontSize: '1.3rem', color: '#4caf50', fontWeight: '600' }}>
              {progress}% Received
            </div>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Receiving: {receivedFile?.fileName || 'File'} ({Math.round(totalReceived.current / 1024 / 1024)}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default P2pReceiver;