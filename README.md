# QuestEd

QuestEd is an open-source educational technology platform enabling intructors to craft story-driven , gamified learning experiences with Artificial Intelligence (AI).

Our mission is to engage and inspire learners through interactive Quests, fostering deep understanding and skill mastery. 


# Technology used

QuestEd is currently built on MERN (MongoDb, Express, React, NodeJs) stack, and leverages Large Language Models (LLMs) through APIs (e.g. Google Gemini API). 


# Project Structure

QuestEd follows a monolith type code architecture with React Front end, and an Express Backend, along with MongoDB database. The React Front end code is in the 'client' folder of the  root directory, while the backend code is in the 'server' folder in root directory.

# Demo

You can check our demo video [here](https://youtu.be/679DOnJxGc0) !

Let us know your thoughts and feedback at ankbhand2@gmail.com

# Installation and Setup

## Developers:
After downloading the repo in your local machine,

### Start the backend server  

 1. Go to QuestEd/server folder   
 `cd QuestEd/server`
 2. Install dependencies  
  `npm install`  
  
  3. Start the node.js server  
  `node app.js`

### Run Front-end locally:

1. Clone the repository  

2. Install Dependencies

`cd QuestEd/client npm install`

3. Start the development server:   
`npm run start`
4. Open your browser and navigate to http://localhost:3000

### Note: Update following environment variables in .env file unique to your case

For Front-end code:   
REACT_APP_URL

For backend code:

MONGO_URI
GOOGLE_GEMINI_API
PORT
FRONTEND_URL


# How to Contribute

More information to be added soon! Please reach out to Ankit Bhandari at ankbhand2@gmail.com for any query. 

# Project Status 

in development

# Future Work:

Incorporate other LLMs.
Improve the User experience by adding more structured prompts.








