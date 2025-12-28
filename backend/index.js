import express from 'express';
import { connectDB } from './db.js';
import dotenv from 'dotenv';
import AuthRoutes from './routes/AuthRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';


const app = express();
const server = http.createServer(app);
dotenv.config();
app.use(express.json());
const io = new Server(server, {
    cors: {
        origin: '*'||'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});
app.use(cors());

io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Admin joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

export const emitToInterns = (event, data) => {
  io.emit(event, data);
};


app.use('/api/auth', AuthRoutes);
app.use('/api/projects',projectRoutes);

app.listen(process.env.PORT || 4022, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`);
    connectDB();
});

export default app;
