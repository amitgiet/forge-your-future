import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { storage } from '../lib/storage';

const SOCKET_URL = 'http://localhost:5002';

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const token = storage.getItemSync('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('error', (err: any) => {
      console.warn('Socket error', err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const joinChat = (chatId: string) => {
    socketRef.current?.emit('join_chat', chatId);
  };

  const sendMessage = (chatId: string, text: string) => {
    socketRef.current?.emit('send_message', { chatId, text });
  };

  const sendTyping = (chatId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { chatId, isTyping });
  };

  const markAsRead = (chatId: string) => {
    socketRef.current?.emit('mark_read', { chatId });
  };

  const onNewMessage = (callback: (message: any) => void) => {
    const socket = socketRef.current;
    if (socket) socket.on('new_message', callback);
    return () => {
      socketRef.current?.off('new_message', callback);
    };
  };

  const onUserTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    const socket = socketRef.current;
    if (socket) socket.on('user_typing', callback);
    return () => {
      socketRef.current?.off('user_typing', callback);
    };
  };

  return {
    connected,
    joinChat,
    sendMessage,
    sendTyping,
    markAsRead,
    onNewMessage,
    onUserTyping,
  };
}
