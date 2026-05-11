# AI Arena 🤖⚔️

A real-time AI battle platform where two AI models compete head-to-head to answer your query, and a neutral AI judge scores them objectively.

## Overview

AI Arena lets you submit a prompt and watch two AI models — **Gemini** (Google) and **Groq** (LLaMA) — generate responses simultaneously via real-time streaming. Once both responses are complete, a third AI model (**Mistral**) acts as a neutral judge and evaluates the responses based on accuracy, clarity, completeness, and relevance.

The platform also supports **RAG (Retrieval-Augmented Generation)**: you can upload a document (PDF or DOCX) and ask questions grounded in its content.

## Features

- 🥊 **Live AI Battle** — Two models stream responses side by side in real time
- ⚖️ **Neutral AI Judge** — Mistral evaluates both responses and declares a winner with ratings and reasoning
- 📄 **RAG Support** — Upload PDF or DOCX files and ask questions about their content
- 🔐 **Authentication** — JWT-based user auth with secure HTTP-only cookies
- 💾 **Conversation History** — Browse and replay past arena battles
- ⚡ **Real-time Streaming** — Powered by Socket.IO for smooth, live response rendering
- 🎨 **Modern UI** — Built with React 19, Tailwind CSS v4, and Framer Motion animations

## Tech Stack

### Frontend (client/)

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Socket.IO Client | Real-time streaming |
| React Router v7 | Client-side routing |
| Axios | HTTP requests |
| react-markdown | Markdown rendering |
| react-hot-toast | Notifications |
| Lucide React | Icons |

### Backend (server/)

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.IO | WebSocket streaming |
| MongoDB + Mongoose | Database |
| Google Generative AI | Gemini model |
| Groq SDK | LLaMA model via Groq |
| Mistral AI | Judge model and RAG |
| @xenova/transformers | Local embeddings for RAG |
| Multer + pdf-parse + mammoth | File upload and parsing |
| JWT + bcryptjs | Authentication |

## Project Structure

```
Ai-Arena-P/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── Arena/       # ModelPanel, JudgePanel
│       │   ├── Auth/        # Login/Signup forms
│       │   ├── Chat/        # ChatInput component
│       │   └── Sidebar/     # Conversation history sidebar
│       ├── context/         # AuthContext, SocketContext
│       ├── hooks/           # useStream hook for real-time streaming
│       ├── pages/           # ArenaPage, HistoryPage, AuthPage
│       └── services/        # API client (axios)
└── server/                  # Node.js backend
    ├── config/              # Database connection
    ├── controllers/         # Route handlers
    ├── middleware/          # Auth middleware
    ├── models/              # Mongoose schemas (User, Conversation, Message, Embedding)
    ├── routes/              # API routes (auth, arena, conversations, rag)
    ├── services/            # AI integrations (gemini, groq, mistral, judge, rag)
    ├── socket/              # Socket.IO stream handler
    └── index.js             # App entry point
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- API keys for Google Gemini, Groq, and Mistral AI

### 1. Clone the repository

```bash
git clone https://github.com/Zubair-OP/Ai-Arena-P.git
cd Ai-Arena-P
```

### 2. Set up the Server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

Start the server:

```bash
npm run dev
```

### 3. Set up the Client

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT token |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/arena/query` | Submit a prompt to the arena |
| GET | `/api/conversations` | Get user conversation history |
| GET | `/api/conversations/:id` | Get a specific conversation |
| POST | `/api/rag/upload` | Upload a PDF or DOCX file |
| POST | `/api/rag/query-with-file` | Query using an uploaded file |

## How It Works

1. **User submits a query** via the chat input on the Arena page
2. The server receives the query and fires requests to **Gemini** and **Groq** simultaneously
3. Both models stream their responses token-by-token via **Socket.IO** to the frontend
4. Once both responses are complete, the **Mistral judge** evaluates them and returns a rating (1-10) for each model, a winner (Model A / Model B / Tie), and a brief reasoning
5. The conversation is saved to **MongoDB** for future reference in the history view

## License

This project is open source. Feel free to use and build upon it.
