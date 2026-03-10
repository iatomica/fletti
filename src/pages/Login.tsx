import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Truck, LogIn, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'CARRIER'>('CLIENT');
  const [vehicle, setVehicle] = useState('');
  const [capacity, setCapacity] = useState('');
  const [zone, setZone] = useState('');

  const { login, register, user } = useAppContext();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'CLIENT' ? '/client' : user.role === 'ADMIN' ? '/admin' : '/carrier');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email);
    } else {
      register({
        name,
        email,
        role,
        ...(role === 'CARRIER' && { vehicle, capacity, zone })
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Truck className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Fletti
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Ingresa a tu cuenta' : 'Crea una cuenta nueva'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre Completo / Empresa
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('CLIENT')}
                    className={`px-4 py-2 text-sm font-medium rounded-md border ${
                      role === 'CLIENT'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CARRIER')}
                    className={`px-4 py-2 text-sm font-medium rounded-md border ${
                      role === 'CARRIER'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Transportista
                  </button>
                </div>
              </div>
            )}

            {!isLogin && role === 'CARRIER' && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">Vehículo</label>
                  <input
                    id="vehicle"
                    type="text"
                    required
                    placeholder="Ej: Camioneta F100"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacidad de Carga</label>
                  <input
                    id="capacity"
                    type="text"
                    required
                    placeholder="Ej: 1000kg, 4m3"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="zone" className="block text-sm font-medium text-gray-700">Zona de Trabajo</label>
                  <input
                    id="zone"
                    type="text"
                    required
                    placeholder="Ej: CABA y GBA Norte"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLogin ? (
                  <><LogIn className="w-5 h-5 mr-2" /> Ingresar</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" /> Registrarse</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md text-xs text-blue-800">
            <p className="font-semibold mb-1">Cuentas de prueba:</p>
            <ul className="list-disc pl-4">
              <li>Cliente: cliente@empresa.com</li>
              <li>Transportista: transportista@fletti.com</li>
              <li>Admin: admin@fletti.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
