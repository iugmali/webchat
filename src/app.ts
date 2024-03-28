import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { Server } from "socket.io";

import { engine } from "express-handlebars";
import {censorWord, FilteredWord} from "./lib/util.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

type Message = {
  author: string;
  message: string;
}

type User = {
  id: string;
  username: string;
}

let message: Message = {author: '', message: ''};
const users: Set<User> = new Set();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', (username: string) => {
    message = {author: 'iugmali-webchat-server', message: `${username} entrou na sala` };
    io.emit('message', message);
    io.emit('join', username);
    users.add({id: socket.id, username: username});
    const usersQty = io.engine.clientsCount
    io.emit('usersQty', usersQty);
  });
  socket.on('message', (userMessage: Message) => {
    const word = censorWord(userMessage.message);
    if (word.censored) {
      message = {author: userMessage.author, message: word.word};
      io.to(socket.id).emit('censored', userMessage.message);
    } else {
      message = {author: userMessage.author, message: userMessage.message};
    }
    const usersQty = io.engine.clientsCount
    io.emit('usersQty', usersQty);
    io.emit('message', message);
  });
  socket.on('disconnect', () => {
    const user = Array.from(users).find(user => user.id === socket.id);
    if (user) {
      message = {author: 'iugmali-webchat-server', message: `${user.username} saiu da sala` };
      io.emit('message', message);
      users.delete(user);
    }
    const usersQty = io.engine.clientsCount
    io.emit('usersQty', usersQty);
  });
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Chat' });
});

app.use(/.*/, (req, res) => {
  req.method = 'GET';
  res.redirect('/');
});

server.listen(8080, () => {
  console.log('Servidor iniciado na porta 8080');
});
