import io from 'socket.io-client';

let socket;

const SOCKET_SERVER_URL = 'https://whiteboardfinal-1.onrender.com';

export const initSocket = () => {
  socket = io(SOCKET_SERVER_URL);
  return socket;
};

export const getSocket = () => socket;
