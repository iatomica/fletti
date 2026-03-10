import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, UserStatus, SystemConfig } from '../types';
import { Users, Package, Shield, Edit2, CheckCircle, XCircle, AlertCircle, Save, X, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AdminDashboard: React.FC = () => {
  const { users, orders, systemConfig, updateUserStatus, editUser, updateSystemConfig } = useAppContext();
  const [activeTab, setActiveTab] = useState<'USERS' | 'ORDERS' | 'INCIDENTS' | 'CONFIG'>('USERS');
  const [userSubTab, setUserSubTab] = useState<'CLIENTS' | 'CARRIERS' | 'ADMINS'>('CLIENTS');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [configForm, setConfigForm] = useState<SystemConfig>(systemConfig);

  const handleStatusChange = (userId: string, status: UserStatus) => {
    updateUserStatus(userId, status);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      editUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(configForm);
    alert('Configuración guardada correctamente');
  };

  const statusColors: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    BLOCKED: 'bg-red-100 text-red-800',
  };

  const clients = users.filter(u => u.role === 'CLIENT');
  const carriers = users.filter(u => u.role === 'CARRIER');
  const admins = users.filter(u => u.role === 'ADMIN');

  const renderUserTable = (userList: User[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            {userSubTab === 'CARRIERS' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {userList.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[user.status]}`}>
                  {user.status === 'ACTIVE' ? 'Activo' : user.status === 'PENDING' ? 'Pendiente' : 'Bloqueado'}
                </span>
              </td>
              {userSubTab === 'CARRIERS' && (
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <div><span className="font-medium">Vehículo:</span> {user.vehicle || '-'}</div>
                    <div><span className="font-medium">Capacidad:</span> {user.capacity || '-'}</div>
                    <div><span className="font-medium">Zona:</span> {user.zone || '-'}</div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="Editar datos"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {user.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                      className="text-green-600 hover:text-green-900 p-1"
                      title={userSubTab === 'CARRIERS' ? 'Aprobar validación' : 'Reactivar'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {user.status !== 'BLOCKED' && (
                    <button
                      onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                      className="text-red-600 hover:text-red-900 p-1"
                      title={userSubTab === 'CARRIERS' && user.status === 'PENDING' ? 'Rechazar validación' : 'Bloquear'}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
          <Shield className="w-6 h-6 mr-2 text-indigo-600" />
          Panel de Administración
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'USERS'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'ORDERS'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-5 h-5 mr-2" />
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('INCIDENTS')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'INCIDENTS'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Incidencias
            </button>
            <button
              onClick={() => setActiveTab('CONFIG')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center transition-colors ${
                activeTab === 'CONFIG'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </button>
          </nav>
        </div>

        <div className="p-6 bg-gray-50 min-h-[500px]">
          {activeTab === 'USERS' && (
            <div className="space-y-6">
              {/* Metrics Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Total Clientes</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{clients.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Total Transportistas</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{carriers.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Usuarios Activos</div>
                  <div className="text-xl font-bold text-green-600 mt-1">{users.filter(u => u.status === 'ACTIVE').length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Pendientes</div>
                  <div className="text-xl font-bold text-yellow-600 mt-1">{users.filter(u => u.status === 'PENDING').length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Bloqueados</div>
                  <div className="text-xl font-bold text-red-600 mt-1">{users.filter(u => u.status === 'BLOCKED').length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Nuevos (Hoy)</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {users.filter(u => u.status === 'PENDING').length}
                  </div>
                </div>
              </div>

              {/* Subtabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="SubTabs">
                  <button
                    onClick={() => setUserSubTab('CLIENTS')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      userSubTab === 'CLIENTS'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Clientes
                  </button>
                  <button
                    onClick={() => setUserSubTab('CARRIERS')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      userSubTab === 'CARRIERS'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Transportistas
                  </button>
                  <button
                    onClick={() => setUserSubTab('ADMINS')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      userSubTab === 'ADMINS'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Administradores
                  </button>
                </nav>
              </div>

              {/* User Tables */}
              {userSubTab === 'CLIENTS' && renderUserTable(clients)}
              {userSubTab === 'CARRIERS' && renderUserTable(carriers)}
              {userSubTab === 'ADMINS' && renderUserTable(admins)}
            </div>
          )}

          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500">Total Pedidos</div>
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500">Pendientes</div>
                  <div className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'PENDING').length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500">En Curso</div>
                  <div className="text-2xl font-bold text-indigo-600">{orders.filter(o => o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT').length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-500">Completados</div>
                  <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'DELIVERED').length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportista</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const client = users.find(u => u.id === order.clientId);
                      const carrier = users.find(u => u.id === order.carrierId);
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                            <div className="text-xs text-gray-500">{format(new Date(order.createdAt), "d MMM, HH:mm", { locale: es })}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{client?.name || 'Desconocido'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 truncate max-w-xs" title={order.origin}>{order.origin}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs" title={order.destination}>→ {order.destination}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{carrier?.name || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-800' : 
                                'bg-green-100 text-green-800'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'INCIDENTS' && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay incidencias activas</h3>
              <p className="text-gray-500 mt-2">Todo funciona correctamente en la plataforma.</p>
            </div>
          )}

          {activeTab === 'CONFIG' && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-200 pb-4">
                Variables Operativas y Comerciales
              </h2>
              
              <form onSubmit={handleConfigSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comisión de Plataforma (%)</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.1"
                        value={configForm.platformCommissionPercent}
                        onChange={(e) => setConfigForm({...configForm, platformCommissionPercent: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Fijo por Operación ($)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={configForm.fixedOperationCharge}
                        onChange={(e) => setConfigForm({...configForm, fixedOperationCharge: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Seguro (%)</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.1"
                        value={configForm.insuranceCostPercent}
                        onChange={(e) => setConfigForm({...configForm, insuranceCostPercent: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasa Administrativa ($)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={configForm.administrativeFee}
                        onChange={(e) => setConfigForm({...configForm, administrativeFee: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recargo por Tipo de Carga ($)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={configForm.surchargeCargoType}
                        onChange={(e) => setConfigForm({...configForm, surchargeCargoType: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recargo por Distancia/Zona ($)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={configForm.surchargeDistanceZone}
                        onChange={(e) => setConfigForm({...configForm, surchargeDistanceZone: parseFloat(e.target.value) || 0})}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-200 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={() => setEditingUser(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[101]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Editar Datos de Usuario
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleEditSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {editingUser.role === 'CARRIER' && (
                    <>
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Datos de Transportista</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Vehículo</label>
                            <input
                              type="text"
                              value={editingUser.vehicle || ''}
                              onChange={(e) => setEditingUser({...editingUser, vehicle: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Capacidad</label>
                            <input
                              type="text"
                              value={editingUser.capacity || ''}
                              onChange={(e) => setEditingUser({...editingUser, capacity: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Zona</label>
                            <input
                              type="text"
                              value={editingUser.zone || ''}
                              onChange={(e) => setEditingUser({...editingUser, zone: e.target.value})}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
