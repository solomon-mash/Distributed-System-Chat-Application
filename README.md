# A Distributed system Chat Application
#### The aim of this project is to practise distributed computing concepts by creating a simple chat application that operates over a network of multiple server nodes and clients.

## Setup

1. Clone the Repository
``` 
git clone https://github.com/solomon-mash/Distributed-Assignment.git 
```

## Backend Server
Open terminal and go to the server directory.

Create a .env file

Fill in values (MONGO_URI, PORT, JWT_SECRET).

Install dependencies:

``` 
npm install
 ```

Start Server

``` 
node server.js
```

## Frontend Setup
Open terminal and go to the chat-client directory.

Install dependencies:

``` 
npm install 
```

Create a .env file

Fill in values (VITE_SOCKET_URL, VITE_API_URL).

 
- Both URLS should match your backend url 



run Server

``` 
npm run dev 
```


## Project Structure
```
CHAT-GUI-APP/
├── client/chat-client/src               # React Frontend
│   ├── components/
│   ├── assets/
│   ├── context/
│   ├── pages/
|   ├── utils
│   └── App.jsx
├── server/                               # Express Backend
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── server.js
└── README.md
```

### User Guide

To test functionality you will need to create an account and login.

After login you have the option to start a conversation on the group chat or with any registered user.

Incase of any issues, feel free to mention it in the group chat

### View Live Preview: https://group-info-chat.vercel.app/
