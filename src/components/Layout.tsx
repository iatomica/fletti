import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogOut, Bell, Truck, UserCircle, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const Layout: React.FC = () => {
  const { user, logout, notifications, markNotificationRead } = useAppContext();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Truck className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">Fletti</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={notifRef}>
                  <button 
                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {unreadCount} nuevas
                          </span>
                        )}
                      </div>
                      {userNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-500 text-center">
                          No tienes notificaciones
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {userNotifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                              onClick={() => !notif.read && markNotificationRead(notif.id)}
                            >
                              <div className="flex justify-between items-start">
                                <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                  {notif.message}
                                </p>
                                {!notif.read && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markNotificationRead(notif.id);
                                    }}
                                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                                    title="Marcar como leída"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <UserCircle className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.role === 'CLIENT' ? 'Cliente' : user.role === 'ADMIN' ? 'Administrador' : 'Transportista'}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
