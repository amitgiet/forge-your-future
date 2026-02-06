import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002';

export const useSocket = (userId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token')
      }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
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
    socketRef.current?.on('new_message', callback);
    return () => {
      socketRef.current?.off('new_message', callback);
    };
  };

  const onUserTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    socketRef.current?.on('user_typing', callback);
    return () => {
      socketRef.current?.off('user_typing', callback);
    };
  };

  return {
    socket: socketRef.current,
    connected,
    joinChat,
    sendMessage,
    sendTyping,
    markAsRead,
    onNewMessage,
    onUserTyping
  };
};
