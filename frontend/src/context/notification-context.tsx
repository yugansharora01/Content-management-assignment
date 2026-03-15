"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { addToast } from "@heroui/react"; // Assuming HeroUI toast exists or using a shim

const NotificationContext = createContext<any>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_NOTIFICATION_URL || 'http://localhost:3003');
    setSocket(newSocket);

    newSocket.on('notification', (data) => {
      console.log("New notification received:", data);
      setNotifications(prev => [data, ...prev].slice(0, 10));
      
      // Visual feedback
      alert(`New Notification: ${data.message || 'System Update'}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, socket }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
