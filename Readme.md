# FutureBlink AI

![1](https://github.com/user-attachments/assets/53cd7b23-9ac8-4acc-9b59-349cbde49a41)
![2](https://github.com/user-attachments/assets/8bb0fbcc-b1de-4bbd-ae01-6ece17b8c0ee)
![3](https://github.com/user-attachments/assets/51015d51-4cc2-43b3-b9de-5af6bbfc644e)


A modern full-stack web application that generates AI responses with a beautiful visual interface using React Flow.

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- MongoDB Atlas Account
- OpenRouter API Key

### Installation

#### 1. Clone & Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

#### 2. Setup Environment Variables

**`server/.env`**

```
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
MONGODB_URI=mongodb+srv://bhanupp:futureBlink@cluster0.ztkqye5.mongodb.net/futureblink
OPENROUTER_API_KEY=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
CLIENT_URL=http://localhost:5173
```

**`client/.env.local`**

```
VITE_API_URL=http://localhost:5000/api
```

#### 3. Start the Application

**Terminal 1 - Backend**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**

```bash
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
FutureBlink/
├── server/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   ├── aiController.js    # OpenRouter API integration
│   │   └── saveController.js  # Database operations
│   ├── models/
│   │   └── PromptSchema.js    # MongoDB schema
│   ├── routes/
│   │   ├── aiRoutes.js        # AI endpoints
│   │   └── saveRoutes.js      # Save endpoints
│   ├── middleware/
│   │   └── errorHandler.js    # Error handling
│   ├── utils/
│   │   └── logger.js          # Winston logger
│   ├── logs/                  # Auto-generated logs
│   ├── server.js              # Main server file
│   └── .env                   # Environment variables
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowChart.jsx     # Main workflow visualization
│   │   │   ├── InputNode.jsx     # Input prompt node
│   │   │   └── ResultNode.jsx    # AI response node
│   │   ├── pages/
│   │   │   └── Dashboard.jsx     # Dashboard page
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── utils/
│   │   │   └── markdownParser.js # Markdown parsing
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # Entry point
│   │   └── App.css               # Styles
│   ├── public/                   # Static files
│   ├── .env.local                # Environment variables
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   └── index.html                # HTML template
│
└── .gitignore
```

---

## 🎯 Features

✅ **React Flow Visualization** - Interactive workflow interface
✅ **AI Integration** - OpenRouter API with gpt-3.5-turbo
✅ **Dark Mode** - Beautiful dark/light theme toggle
✅ **Database Persistence** - Save conversations to MongoDB
✅ **Real-time Response** - Stream AI responses
✅ **Professional UI** - Tailwind CSS with gradient design
✅ **Logging System** - Winston logger for debugging
✅ **Error Handling** - Comprehensive error messages

---

## 🔌 API Endpoints

### Health Check

```
GET /api/health
```

### Generate AI Response

```
POST /api/ask-ai
Body: { "prompt": "Your question here" }
Response: { "success": true, "response": "AI answer", "model": "gpt-3.5-turbo" }
```

### Save Prompt

```
POST /api/save
Body: { "prompt": "Question", "response": "Answer" }
Response: { "success": true, "data": { ... } }
```

### Get All Prompts

```
GET /api/prompts?page=1&limit=10
```

### Delete Prompt

```
DELETE /api/prompts/:id
```

---

## 🛠️ Technology Stack

### Frontend

- React 18
- Vite
- TailwindCSS 4.1
- React Flow (@xyflow/react)
- Axios
- Lucide Icons

### Backend

- Express.js
- Node.js
- MongoDB + Mongoose
- Helmet (Security)
- Winston (Logging)
- Axios

### External Services

- OpenRouter API (AI)
- MongoDB Atlas (Database)

---

## 📝 Usage

### 1. Ask a Question

- Type your prompt in the Input Node
- Click "Generate" or press Enter

### 2. View Response

- AI response appears in Result Node
- See response stats (words, characters)

### 3. Save to Database

- Click "Save" to store conversation
- Access history anytime

### 4. Toggle Dark Mode

- Click sun/moon icon in header
- Theme saves to localStorage

---

## 🐛 Troubleshooting

### 500 Error on API Call

- Check `.env` file has correct API key
- Verify MongoDB URI is correct
- Check backend logs for details

### Response Not Displaying

- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12) for errors
- Restart frontend server

### Connection Refused

- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- Check firewall settings

### Rate Limited

- Free models have strict limits
- Wait 5-10 minutes before retrying
- Use gpt-3.5-turbo for better stability

---

## 🔧 Commands

### Backend

```bash
npm run dev        # Start development server
npm start          # Start production server
```

### Frontend

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 📦 Dependencies

### Backend

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.1.1",
  "helmet": "^8.1.0",
  "winston": "^3.19.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "axios": "^1.13.2"
}
```

### Frontend

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@xyflow/react": "^12.3.2",
  "tailwindcss": "^4.1.0",
  "axios": "^1.6.8",
  "lucide-react": "^0.376.0"
}
```

---

## 🚀 Deployment

### Deploy Backend (Render.com)

1. Push code to GitHub
2. Connect GitHub to Render
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set build: `npm run build`
4. Deploy

---

## 📞 Support

For issues or questions:

- Check logs in `server/logs/`
- Review error messages in browser console
- Check `.env` configuration
- Verify API key and MongoDB connection

---

## 📄 License

MIT License - Feel free to use this project

---

## 👨‍💻 Author

**FutureBlink Team**

Built with ❤️ using MERN Stack

---

## 🎉 Ready to Use!

Your FutureBlink application is now ready. Start both servers and enjoy the beautiful AI-powered interface!

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Open http://localhost:5173
```

Happy coding! 🚀
