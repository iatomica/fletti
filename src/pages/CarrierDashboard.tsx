import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { OrderCard } from '../components/OrderCard';
import { Map, List, CheckCircle } from 'lucide-react';

export const CarrierDashboard: React.FC = () => {
  const { user, orders, acceptOrder, updateOrderStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ACTIVE' | 'HISTORY'>('AVAILABLE');

  const availableOrders = orders.filter(o => o.status === 'PENDING');
  const activeOrders = orders.filter(o => o.carrierId === user?.id && (o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT'));
  const historyOrders = orders.filter(o => o.carrierId === user?.id && o.status === 'DELIVERED');

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Transportista</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('AVAILABLE')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'AVAILABLE'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="w-5 h-5 mr-2" />
              Disponibles
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {availableOrders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'ACTIVE'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="w-5 h-5 mr-2" />
              Viaje Activo
              {activeOrders.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-600 py-0.5 px-2.5 rounded-full text-xs">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'HISTORY'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Historial
            </button>
          </nav>
        </div>

        <div className="p-6 bg-gray-50 min-h-[400px]">
          {activeTab === 'AVAILABLE' && (
            <div>
              {availableOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No hay pedidos disponibles en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      userRole="CARRIER"
                      onAccept={acceptOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACTIVE' && (
            <div>
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No tienes viajes activos.</p>
                  <button
                    onClick={() => setActiveTab('AVAILABLE')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Ver pedidos disponibles
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      userRole="CARRIER"
                      onUpdateStatus={updateOrderStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div>
              {historyOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Aún no has completado ningún viaje.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historyOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      userRole="CARRIER"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
