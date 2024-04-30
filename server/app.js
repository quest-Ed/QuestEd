const express = require('express');
const app= express();
const expressWs = require('express-ws')(app);
const chatRouter = require('./routes/chat');


app.use(cors({
  origin: 'http://localhost:3001' // Allow your React app to connect
}));

const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to QuestEd!');
});

app.use('/chat', chatRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});