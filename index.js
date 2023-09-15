// const io = require("socket.io")(9000,{
//     cors: {
//         origin: "http://localhost:5173"
//     }
// })
// console.log(io)

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 9000;

app.use(cors());

// Create a Socket.io instance and attach it to the server
const io = socketIo(server, {
  cors: {
    origin: ["https://soulmate-matrimony.netlify.app/", "https://soulmate-matrimony.netlify.app/"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

let users = [];
const addUser = (userId,socketId) => {
    !users.some((user) => user.userId === userId) &&
    users.push({userId,socketId})
}
//remove user the user list
const removeUser = (socketId) => {
    users = users.filter(user=> user.socketId !== socketId)
}

// get user by id
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

io.on('connect', (socket)=> {
    //when connect
    console.log("a user connected")
    socket.on("addUser", (userId) => {
        addUser(userId,socket.id)
        io.emit("getUsers", users)
    })

    //disconnect function from anyone disconnect
    socket.on("disconnect", ()=> {
        console.log("a user disconnected!");
        removeUser(socket.id)
        io.emit("getUsers", users)
    })

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
      })

} )

app.get("/", (req, res) => {
    res.send("socket io is running");
  });

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});