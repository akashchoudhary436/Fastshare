
# FastShare

## Overview

**FastShare** is a sophisticated file-sharing application with a variety of features, including direct peer-to-peer (P2P) data transfer, torrent-like functionality, and cloud-based storage with auto-delete capabilities. The application is built using a React.js frontend and a Spring Boot backend, and it leverages PostgreSQL for database management.

### Key Features

1. **Direct P2P Data Transfer**: Efficiently share files directly between peers with chunked and concurrent uploads and downloads.

2. **Torrent-like Functionality**: 
   - Custom torrent tracker that allows multiple users to join and participate in file sharing.
   - Users can create and upload torrent files to the server, where a hash link is generated.
   - Recipients use this hash link to start downloading files, with support for chunked transfers similar to traditional torrents.

3. **Cloud-Based Storage**: 
   - Upload files to a cloud storage system with an automatic deletion feature to manage storage space effectively.


