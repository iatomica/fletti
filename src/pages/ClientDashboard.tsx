import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { OrderCard } from '../components/OrderCard';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { Plus } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { user, orders, users, createOrder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const myOrders = orders.filter(o => o.clientId === user?.id);

  const handleCreateOrder = (orderData: any) => {
    createOrder(orderData);
    // Modal handles its own closing/resetting after success
  };

  const getCarrierName = (carrierId?: string) => {
    if (!carrierId) return undefined;
    const carrier = users.find(u => u.id === carrierId);
    return carrier ? carrier.name : 'Desconocido';
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Pedidos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Pedido
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No tienes pedidos activos.</p>
          <p className="text-gray-400 text-sm mt-2">Crea un nuevo pedido para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              userRole="CLIENT"
              carrierName={getCarrierName(order.carrierId)}
            />
          ))}
        </div>
      )}

      <CreateOrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateOrder} 
      />
    </div>
  );
};
