import { sendGet, sendPost, sendPatch, sendDelete } from "../apiClient"
import { ConfigFakeOrderEndPoint } from "./contants"

export interface IValidUserParams {
  order?: string
  page?: number
  take?: number
  search?: string
  status?: string
}

export interface IFakeOrderItem {
  shopProductId: string
  quantity: number
}

export interface ICreateFakeOrderPayload {
  items: IFakeOrderItem[]
  email?: string
  phone?: string
  address: string
  userId: string
  orderTime?: string
  countryId?: string;
  stateId?: string;
  cityId?: string;
  districtId?: string;
  postalCode?: string;
  deliveryScope?: 'domestic' | 'global';
}

export interface IShopOrderParams {
  order?: string
  page?: number
  take?: number
  search?: string
  shopId: string
  delayStatus?: string
  status?: string
}

export interface IShopOrderResponse {
    status: boolean;
    message: string;
    data: {
        data: IShopOrderItem[];
        meta: {
            take: number;
            itemCount: number;
            pageCount: number;
            hasPreviousPage: boolean;
            hasNextPage: boolean;
        };
    };
    errors: null;
    timestamp: string;
}

export interface IShopOrderItem {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    userId: string;
    shopId: string;
    totalAmount: string;
    totalProfit: string;
    status: string;
    delayStatus: string;
    paymentStatus: string;
    confirmedAt: string | null;
    deliveredAt: string | null;
    cancelledAt: string | null;
    email: string | null;
    phone: string | null;
    countryId: string | null;
    stateId: string | null;
    cityId: string | null;
    districtId: string | null;
    postalCode: string | null;
    orderTime: string | null;
    address: string | null;
    items: IShopOrderItemDetail[];
    user: IShopOrderUser;
}

export interface IShopOrderItemDetail {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    orderId: string;
    shopProductId: string;
    userId: string;
    quantity: number;
    price: string;
    totalAmount: string;
    fedexAmount: string | null;
    isFedexPaid: boolean;
    shopProduct: IShopProduct;
}

export interface IShopProduct {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isActive: boolean;
    profit: string;
    soldCount: number;
}

export interface IShopOrderUser {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    username: string;
    fullName: string;
    phone: string;
    invitationCode: string;
    referralCode: string | null;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    balance: string;
    fedexBalance: string;
}

export interface IUpdateFakeOrderPayload {
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  delayStatus?: string;
  paymentStatus?: string;
  orderTime?: string;
  confirmedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  paidAt?: string;
}

export interface IOrderParams {
  order?: string
  page?: number
  take?: number
  search?: string
  status?: string
}

export interface IOrderResponse {
  status: boolean;
  message: string;
  data: any;
  errors: any;
  timestamp: string;
}

// Get valid users for fake order
export const getValidUsers = async (params: IValidUserParams) => {
  const res = await sendGet(ConfigFakeOrderEndPoint.VALID_USERS, params)
  return res
}

// Get all orders
export const getOrders = async (params: IOrderParams): Promise<IOrderResponse> => {
  const res = await sendGet("/admin/orders", params)
  return res
}

export const createFakeOrder = async (payload: ICreateFakeOrderPayload) => {
  const res = await sendPost(ConfigFakeOrderEndPoint.BASE, payload)
  return res
}

export const deliverFakeOrder = async (id: string) => {
  const res = await sendPost(ConfigFakeOrderEndPoint.DELIVER(id))
  return res
}

// Get shop orders
export const getShopOrders = async (params: IShopOrderParams): Promise<IShopOrderResponse> => {
    const res = await sendGet(ConfigFakeOrderEndPoint.SHOP_ORDERS, params);
    return res;
}

export const updateFakeOrder = async (orderId: string, payload: IUpdateFakeOrderPayload) => {
  const res = await sendPatch(ConfigFakeOrderEndPoint.BASE + `/${orderId}`, payload);
  return res;
}

export const deleteFakeOrder = async (orderId: string) => {
  const res = await sendDelete(ConfigFakeOrderEndPoint.BASE + `/${orderId}`);
  return res;
} 