const express = require('express');
const cors = require('cors');
const app= express();
const expressWs = require('express-ws')(app);
const chatRouter = require('./routes/chat');
require('dotenv').config();

app.use(cors({
  origin: process.env.FRONTEND_URL // Allow your React app to connect
}));

app.use(express.json()); // for parsing application/json


app.use(express.urlencoded({ extended: true }));



// app.get('/', (req, res) => {
//   res.send('Welcome to QuestEd!');
// });

app.use('/chat', chatRouter);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});