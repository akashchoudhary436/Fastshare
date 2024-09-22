import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import JSZip from 'jszip';

const socket = io('http://localhost:3001');

function P2pReceiver() {
  const { roomId } = useParams();
  const [receivedFile, setReceivedFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [progress, setProgress] = useState(0);
  const peerConnection = useRef(null);
  const receivedChunks = useRef({});
  const [fileReceived, setFileReceived] = useState(false);
  const totalReceived = useRef(0);
  const totalFileSize = useRef(0);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.ondatachannel = (event) => {
      const receiveChannel = event.channel;

      receiveChannel.onopen = () => {
        console.log('Data channel is open');
      };

      receiveChannel.onmessage = (event) => {
        try {
          if (typeof event.data === 'string') {
            if (event.data === 'EOF') {
              console.log('End of file transfer');
              reassembleFiles();
            } else {
              handleMetadata(event.data); // Handle metadata separately
            }
          } else if (event.data instanceof ArrayBuffer) {
            handleChunk(event.data); // Handle chunk separately
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
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
        console.error('Error adding received ice candidate:', error);
      }
    });

    return () => {
      peerConnection.current.close();
      socket.off('webrtc-offer');
      socket.off('ice-candidate');
    };
  }, [roomId]);

  // Handle metadata received from sender
  const handleMetadata = (data) => {
    try {
      const metadata = JSON.parse(data);
      
      if (metadata.folderName) setFolderName(metadata.folderName);

      if (metadata.fileName && metadata.fileSize) {
        receivedChunks.current[metadata.relativePath] ||= [];
        totalFileSize.current += metadata.fileSize;
      }
      
     } catch(error){
       console.error("Error parsing metadata:", error);
     }
   }

   // Handle chunk received from sender
   const handleChunk= (chunk)=>{
     try{
       const filePath= Object.keys(receivedChunks.current).slice(-1)[0];
       receivedChunks.current[filePath].push(chunk);
       totalReceived.current += chunk.byteLength;

       // Update progress state
       setProgress(Math.floor((totalReceived.current / totalFileSize.current) * 100));

     }catch(error){
       console.error("Error handling chunk:", error)
     }
   }

   // Reassemble files after receiving all chunks
   const reassembleFiles= ()=>{
     try{
       const zip= new JSZip();

       Object.entries(receivedChunks.current).forEach(([filePath,chunks])=>{
         let combinedArrayBuffer= new Uint8Array(totalFileSize.current);
         let offset=0;

         chunks.forEach(chunk=>{
           combinedArrayBuffer.set(new Uint8Array(chunk), offset)
           offset+= chunk.byteLength;
         });

         zip.file(filePath,new Blob([combinedArrayBuffer]));
       });

       zip.generateAsync({type:'blob'}).then(content=>{
         let downloadLink= URL.createObjectURL(content)
         setReceivedFile({fileName:`${folderName || 'received_files'}.zip`,fileUrl:downloadLink});
         setFileReceived(true)
       })

     }catch(error){
       console.error("Error reassembling files:", error)
     }
   }

   return (
     <div>
       <h1>Receiver</h1>
       {fileReceived ? (
         <div>
           <h2>Received File</h2>
           <a href={receivedFile.fileUrl} download={receivedFile.fileName}>
             Download {receivedFile.fileName}
           </a>
         </div>
       ) : (
         <div>
           <p>Waiting for file...</p>
           <progress value={progress} max="100">
             {progress}%
           </progress>
         </div>
       )}
     </div>
   );
}

export default P2pReceiver;