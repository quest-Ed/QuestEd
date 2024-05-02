const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const chatRouter = require('./routes/chat');  // Assuming your chat logic is separated here
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true // Important for cookies, authorization headers with HTTPS 
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: {
      origin: process.env.FRONTEND_URL, // or your frontend's URL
      methods: ["GET", "POST"],
      credentials: true
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/chat', chatRouter(io)); // Pass the io instance to the router

// Catch-all route for testing that the server is running
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
