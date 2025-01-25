# 🚀 AI Helpdesk System

An intelligent, AI-powered support platform designed to revolutionize technical issue resolution across organizations.

## 📦 Project Structure
- **Frontend**: React-based user and admin interfaces
- **Core Backend**: Python-powered AI resolution engine
- **Server**: Golang backend for robust infrastructure

## 🔧 Quick Start

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Start user interface
npm run start-port1

# Start admin interface
npm run start-port2
```

### Backend Setup

#### Python Core Backend
```bash
# Navigate to core backend
cd core_backend

# Run development server
uvicorn main:app --reload
```

#### Golang Server
```bash
# Navigate to server directory
cd server

# Install dependencies
go mod tidy

# Run server
go run .
```

## 🔐 Configuration
- Copy `sample.env` from `core_backend` and `server`
- Create `.env` files with your specific configurations

## 🌟 Key Features
- AI-powered ticket resolution
- Cross-team knowledge sharing
- Automatic escalation
- Continuous learning mechanism

## 🚧 Prerequisites
- Node.js LTS
- Python 3.8+
- Golang 1.22.0+
- Required dependencies (see respective package files)