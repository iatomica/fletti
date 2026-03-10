import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Order, AppNotification, OrderStatus, UserStatus, SystemConfig } from '../types';

interface AppContextType {
  user: User | null;
  users: User[];
  orders: Order[];
  notifications: AppNotification[];
  systemConfig: SystemConfig;
  login: (email: string) => void;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'status'>) => void;
  createOrder: (order: Omit<Order, 'id' | 'clientId' | 'status' | 'createdAt'>) => void;
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markNotificationRead: (notificationId: string) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  editUser: (userId: string, data: Partial<User>) => void;
  updateSystemConfig: (config: SystemConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock initial data
const initialUsers: User[] = [
  { id: '1', name: 'Empresa A', email: 'cliente@empresa.com', role: 'CLIENT', status: 'ACTIVE' },
  { id: '2', name: 'Juan Perez', email: 'transportista@fletti.com', role: 'CARRIER', status: 'ACTIVE', vehicle: 'Camioneta F100', capacity: '1000kg', zone: 'CABA' },
  { id: '3', name: 'Admin Principal', email: 'admin@fletti.com', role: 'ADMIN', status: 'ACTIVE' },
];

const initialOrders: Order[] = [
  {
    id: '101',
    clientId: '1',
    orderType: 'Muebles',
    origin: 'Av. Corrientes 1234, CABA',
    destination: 'Av. Santa Fe 4321, CABA',
    cargoType: 'Muebles de oficina',
    sizeWeight: '500kg, 2m3',
    dateTime: '2023-11-15T10:00',
    notes: 'Llamar al llegar. Cuidado con los vidrios.',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    estimatedCost: 15000,
    trackingCode: 'TRK-101-ABC'
  }
];

const initialSystemConfig: SystemConfig = {
  platformCommissionPercent: 10,
  fixedOperationCharge: 500,
  insuranceCostPercent: 1,
  surchargeCargoType: 1500,
  surchargeDistanceZone: 2000,
  administrativeFee: 300,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(initialSystemConfig);

  // Load from localStorage if available (simple persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('fletti_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedOrders = localStorage.getItem('fletti_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    const savedUsers = localStorage.getItem('fletti_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    const savedConfig = localStorage.getItem('fletti_config');
    if (savedConfig) {
      setSystemConfig(JSON.parse(savedConfig));
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('fletti_user', JSON.stringify(user));
    else localStorage.removeItem('fletti_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('fletti_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fletti_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fletti_config', JSON.stringify(systemConfig));
  }, [systemConfig]);

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert('Usuario no encontrado');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = (newUser: Omit<User, 'id' | 'status'>) => {
    if (users.some(u => u.email === newUser.email)) {
      alert('El email ya está registrado');
      return;
    }
    const userWithId: User = { ...newUser, id: Date.now().toString(), status: 'PENDING' };
    setUsers([...users, userWithId]);
    setUser(userWithId);
  };

  const createNotification = (userId: string, message: string) => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      userId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'clientId' | 'status' | 'createdAt'>) => {
    if (!user || user.role !== 'CLIENT') return;
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      clientId: user.id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      trackingCode: `TRK-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`
    };
    setOrders([newOrder, ...orders]);
    
    // Notify all carriers
    users.filter(u => u.role === 'CARRIER').forEach(carrier => {
      createNotification(carrier.id, `Nuevo pedido disponible desde ${newOrder.origin}`);
    });
  };

  const acceptOrder = (orderId: string) => {
    if (!user || user.role !== 'CARRIER') return;
    
    // Check if carrier already has an active order
    const hasActiveOrder = orders.some(o => o.carrierId === user.id && (o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT'));
    if (hasActiveOrder) {
      alert('No puedes aceptar múltiples viajes simultáneos.');
      return;
    }

    setOrders(orders.map(o => {
      if (o.id === orderId && o.status === 'PENDING') {
        createNotification(o.clientId, `Tu pedido ha sido aceptado por ${user.name}`);
        return { ...o, status: 'ACCEPTED', carrierId: user.id };
      }
      return o;
    }));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (!user || user.role !== 'CARRIER') return;
    setOrders(orders.map(o => {
      if (o.id === orderId && o.carrierId === user.id) {
        createNotification(o.clientId, `El estado de tu pedido ha cambiado a: ${status}`);
        return { ...o, status };
      }
      return o;
    }));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    if (!user || user.role !== 'ADMIN') return;
    setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
    createNotification(userId, `Tu cuenta ha sido ${status === 'ACTIVE' ? 'activada' : status === 'BLOCKED' ? 'bloqueada' : 'puesta en revisión'}`);
  };

  const editUser = (userId: string, data: Partial<User>) => {
    if (!user || user.role !== 'ADMIN') return;
    setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const updateSystemConfig = (config: SystemConfig) => {
    if (!user || user.role !== 'ADMIN') return;
    setSystemConfig(config);
  };

  return (
    <AppContext.Provider value={{
      user, users, orders, notifications, systemConfig,
      login, logout, register, createOrder, acceptOrder, updateOrderStatus, markNotificationRead,
      updateUserStatus, editUser, updateSystemConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
