<h1 align="center">InkCode Fusion</h1>

<p align="center">
  A real-time collaborative coding and technical interview platform: shared code editor, live code execution, chat, and video/voice calls in one web app.
</p>

<p align="center">
  Created by <a href="https://github.com/AkshatGoswami27">Akshat Goswami</a>
</p>

---

## My Contributions

<!-- Keep only the lines that describe work you really did, and add anything missing. -->

- Integrated the **Piston API** for live multi-language code execution
- Implemented peer-to-peer **video and voice communication** with **WebRTC**
- Containerized the app with **Docker** and deployed it using a **Turborepo** monorepo on **Vercel** and **Render**
- Resolved Redis/worker architecture issues by integrating direct API calls

---

## Key Features

### Real-time Code Editor
- **Multi-user synchronization**: the editor stays in sync across everyone in the room.
- **Multiple languages** with syntax highlighting.
- **Code history** to step back through changes during a session.

### Integrated Chat
- **Real-time messaging** while you code.
- **Chat history** kept for reviewing the discussion after the session.

### Video/Voice Calls
- **Face-to-face collaboration** with video and voice calls inside the platform.
- **Group sessions** with multiple participants.

### Live Code Execution
- **Run code instantly** and see the output without leaving the app.
- **Multi-language support**, including Python and JavaScript.

### Collaborative Whiteboard (Planned)
- A shared whiteboard for diagrams while coding.

---

## Tech Stack

<!-- Edit this list so it matches the code in your repo. -->

**Frontend:** React.js, Tailwind CSS, CodeMirror
**Backend:** Node.js, Socket.IO
**Video/Voice:** WebRTC
**Code execution:** Piston API
**Tooling and deployment:** Docker, Turborepo, Vercel, Render

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- Yarn: `npm install --global yarn`

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/AkshatGoswami27/InkCodeFusion.git
   cd InkCodeFusion
   ```
2. Start Redis with Docker (skip this step if your version no longer uses Redis)
   ```bash
   docker run --rm --name redis -p 6379:6379 redis
   ```
3. Install dependencies
   ```bash
   yarn install
   ```
4. Run in development mode
   ```bash
   yarn dev
   ```
5. Open http://localhost:3000

---

## Usage

1. Create a new room or join an existing one.
2. Write code together in the synced editor.
3. Use the chat and the video/voice call to discuss your approach.
4. Run your code and share the result with everyone in the room.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file.

---

## Acknowledgments

- [Piston](https://github.com/engineer-man/piston) for the code execution API.
