   # 🚀 FastShare

FastShare is a sophisticated, high-performance file-sharing architecture built to handle robust file transfers. It offers a variety of sharing methods including direct peer-to-peer (P2P) data transfer, BitTorrent-like chunked torrent functionality, and enterprise-grade centralized cloud storage using Backblaze B2.

Whether you need to instantly pass a file directly to a peer, distribute a large file across multiple machines via a torrent swarm, or securely stash files in the cloud with auto-delete capabilities, FastShare handles it effortlessly.

---

## 🔥 What it can do
1. **Direct P2P Data Transfer**: Share files directly between peers with chunked and concurrent uploads and downloads for maximum speed without server bottlenecks.
2. **Torrent Distribution System**:
   - Custom BitTorrent tracker enabling swarm connections.
   - Upload torrent files to the server and generate distributable hash links.
   - Recipients download files using these hash links, leveraging traditional chunked P2P torrent protocols natively in the browser.
3. **Cloud-Based Storage**: Upload files directly to a cloud storage system (Backblaze B2) featuring automated deletion rules to manage space safely and effectively.

---

## 🛠 Technologies Used
FastShare relies on a modern JavaScript-centric scalable monorepo architecture:
- **Frontend**: React.js, React Router, Styled Components, Material UI
- **Backend Services**: Node.js & Express (Handling chunking, tracking, and cloud uploads)
- **Torrent/Tracker Engine**: `bittorrent-tracker` and `webtorrent` logic
- **Cloud Storage**: Backblaze B2 Integration
- **Automation**: Custom PowerShell & Bash startup scripts

---

## 📁 Project Structure
The repository is broken down into modular micro-services:

```text
Fastshare/
├── backblaze-upload/  # Microservice handling direct file uploads to Backblaze B2
├── backend/           # Core API backend (Authentication, metadata, logic)
├── frontend/          # React.js user interface
├── torrent/           # Torrent generation and parsing service
├── tracker/           # Custom BitTorrent tracker for P2P swarm management
├── loginn/            # Authentication & Login service
├── desktop-torrent/   # Desktop-native client (Optional)
├── setup.sh           # Native startup script for UNIX/Linux/Bash
└── start_all.ps1      # Native startup script for Windows PowerShell
```

---

## ⚙️ How to Run the Project (One-Click Setup)

FastShare utilizes custom-built scripts that completely automate the startup sequence. You don't need to manually start each folder—the script will automatically loop through every folder, check if your `node_modules` are installed (and automatically run `npm install` gracefully if they are missing), build the torrent service from scratch, and spin up the servers concurrently.

### For Windows (PowerShell)
This is the optimal native way to run the software on Windows.

1. Navigate to the root directory `Fastshare/`.
2. Right-click the **`start_all.ps1`** file and select **Run with PowerShell**.
   *(Alternatively, run `.\start_all.ps1` directly inside your terminal).*
3. A unique terminal window will pop up independently for each micro-service (frontend, backend, trackers), completely self-managed!

### For Mac / Linux (Bash)
If you are developing inside a UNIX-like environment:

1. Open your terminal in the root directory.
2. Ensure the script is executable by running:
   ```bash
   chmod +x setup.sh
   ```
3. Execute the script:
   ```bash
   ./setup.sh
   ```
4. All services will spin up securely in the background and output logs directly to your current terminal session.

---

## 📝 License
This project is licensed under the ISC License.
