export interface IOrderDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  shopId: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  deliveryStage: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  items: IOrderItemDetail[];
  delayMessages: IOrderDelayMessage[];
  orderTime: Date;
  totalPaidAmount?: string;
  totalProfit?: string;
  delayStatus?: string;
  user?: any;
  shop?: any;
  stageDelivery?: string;
}

export interface IOrderItemDetail {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  totalAmount: string;
  product: {
    id: string;
    name: string;
    description: string;
    images: string[];
  };
}

export interface IOrderDelayMessage {
  id: string;
  orderId: string;
  message: string;
  delayTime: string;
  createdAt: string;
}

export interface IDeliveryStage {
  id: string;
  name: string;
  description: string;
  orderStatus: string;
}

export interface IDeliveryStagesResponse {
  status: boolean;
  message: string;
  data: IDeliveryStage[];
  errors: null;
  timestamp: string;
}

export interface IOrderDetailResponse {
  status: boolean;
  message: string;
  data: IOrderDetail;
  errors: null;
  timestamp: string;
} 