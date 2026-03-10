export type UserRole = 'CLIENT' | 'CARRIER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  // Carrier specific
  vehicle?: string;
  capacity?: string;
  zone?: string;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';

export interface Order {
  id: string;
  clientId: string;
  orderType: string;
  origin: string;
  destination: string;
  cargoType: string;
  sizeWeight: string;
  dateTime: string;
  notes: string;
  status: OrderStatus;
  carrierId?: string;
  createdAt: string;
  declaredValue?: number;
  insuredGoodsDescription?: string;
  estimatedCost?: number;
  trackingCode?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SystemConfig {
  platformCommissionPercent: number;
  fixedOperationCharge: number;
  insuranceCostPercent: number;
  surchargeCargoType: number;
  surchargeDistanceZone: number;
  administrativeFee: number;
}
