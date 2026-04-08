export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  menu: MenuItem[];
  isOpen: boolean;
  rating?: number;
  deliveryTime?: string;
}

export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export type Order = {
  id: string;
  customerId: string;
  restaurantId: string;
  items: { menuItem: MenuItem; quantity: number; priceAtOrder: number }[];
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
}

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
}

