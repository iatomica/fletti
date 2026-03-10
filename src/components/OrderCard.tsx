import React from 'react';
import { Order, OrderStatus } from '../types';
import { MapPin, Package, Calendar, Clock, Truck, FileText, DollarSign, Tag, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  userRole: 'CLIENT' | 'CARRIER';
  onAccept?: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  carrierName?: string;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  IN_TRANSIT: 'En Camino',
  DELIVERED: 'Entregado',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, userRole, onAccept, onUpdateStatus, carrierName }) => {
  const isCarrier = userRole === 'CARRIER';
  const isClient = userRole === 'CLIENT';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-gray-500">#{order.id}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          {order.trackingCode && (
            <div className="flex items-center text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
              <Hash className="w-3 h-3 mr-1" />
              {order.trackingCode}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {format(new Date(order.createdAt), "d MMM, HH:mm", { locale: es })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Origen</div>
            <div className="font-medium text-gray-900">{order.origin}</div>
          </div>
        </div>

        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Destino</div>
            <div className="font-medium text-gray-900">{order.destination}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
          <div className="flex items-start">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Tipo</div>
              <div className="text-sm font-medium text-gray-900">{order.orderType || 'General'}</div>
            </div>
          </div>

          <div className="flex items-start">
            <Package className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Carga</div>
              <div className="text-sm font-medium text-gray-900">{order.cargoType}</div>
              <div className="text-xs text-gray-500">{order.sizeWeight}</div>
            </div>
          </div>

          <div className="flex items-start">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
            <div>
              <div className="text-xs text-gray-500">Fecha/Hora</div>
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(order.dateTime), "d MMM, HH:mm", { locale: es })}
              </div>
            </div>
          </div>

          {order.estimatedCost && (
            <div className="flex items-start">
              <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
              <div>
                <div className="text-xs text-gray-500">Costo Estimado</div>
                <div className="text-sm font-medium text-gray-900">
                  ${order.estimatedCost.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {order.notes && (
          <div className="flex items-start pt-2">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-gray-600 italic">"{order.notes}"</div>
          </div>
        )}

        {carrierName && (
          <div className="flex items-center pt-4 border-t border-gray-50">
            <Truck className="w-4 h-4 text-indigo-500 mr-2" />
            <span className="text-sm text-gray-700">Transportista asignado: <span className="font-medium">{carrierName}</span></span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        {isCarrier && order.status === 'PENDING' && onAccept && (
          <button
            onClick={() => onAccept(order.id)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Aceptar Viaje
          </button>
        )}

        {isCarrier && order.status === 'ACCEPTED' && onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(order.id, 'IN_TRANSIT')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Marcar En Camino
          </button>
        )}

        {isCarrier && order.status === 'IN_TRANSIT' && onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Marcar Entregado
          </button>
        )}
      </div>
    </div>
  );
};
