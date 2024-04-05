const socket = io();

const chatbox = document.getElementById('chatbox');
const users = document.getElementById('users');
const sendButton = document.getElementById('send');

let user;

Swal.fire({
  title: 'Seu nome',
  input: 'text',
  inputValidator: (value) => {
    return !value && 'Você precisa digitar um nome';
  },
  inputAttributes: {
    autocapitalize: 'off'
  },
  padding: '3rem',
  color: 'white',
  background: '#340634',
  backdrop: 'rgba(255,255,255,0.4)',
  allowOutsideClick: false,
  showCancelButton: false,
  confirmButtonText: 'ENTRAR',
  confirmButtonColor: '#351151',
  showLoaderOnConfirm: true,
  preConfirm: async (login) => {
    try {
      const response = await fetch('/usercheck', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: login})
      });
      if (response.status === 204) {
        socket.emit('join', login);
      } else if (response.status === 400) {
        Swal.showValidationMessage(`${login} não é um nome válido`);
      } else if (response.status === 403) {
        Swal.showValidationMessage(`${login} já está conectado na sala`);
      }
    } catch (error) {
      Swal.showValidationMessage(error.message);
    }
  },
}).then((result) => {
  user = result.value;
  chatbox.focus();

  sendButton.addEventListener('click', () => {
    const text = chatbox.value.trim();
    if (!text) return;
    socket.emit('message', {author: user, text});
    chatbox.value = '';
    chatbox.focus()
  });

  chatbox.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      const text = chatbox.value.trim();
      if (!text) return;
      socket.emit('message', {author: user, text});
      chatbox.value = '';
      chatbox.focus()
    }
  });

  socket.on('usersQty', (qty) => {
    users.innerHTML = `usuários conectados: ${qty}`;
  });

  socket.on('join', (name) => {
    Swal.fire({
      text: `${name} entrou na sala`,
      color: 'white',
      showConfirmButton: false,
      background: '#340634',
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: 'top-right'
    });
  });

  socket.on('censored', (message) => {
    Swal.fire({
      text: `A sua mensagem "${message}" foi censurada`,
      color: 'white',
      showConfirmButton: false,
      background: '#340634',
      timer: 1500,
      timerProgressBar: true,
      toast: true,
      position: 'top-right'
    });
  });

  socket.on('message', (message) => {
    const messagesList = document.getElementById('messages');
    const msgElem = document.createElement('div');
    const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    msgElem.className = 'message';
    msgElem.innerHTML = message.author === 'iugmali-webchat-server'
      ? `<span class="system">${timestamp}: ${message.text}</span>`
      : `<strong>${timestamp} - ${message.author}:</strong> ${message.text}`;
    messagesList.appendChild(msgElem);
    messagesList.scrollTop = messagesList.scrollHeight;
  });
});




