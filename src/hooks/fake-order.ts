import type {
  ICreateFakeOrderPayload,
  IShopOrderParams,
  IShopOrderResponse,
  IUpdateFakeOrderPayload,
  IValidUserParams,
  IOrderParams,
  IOrderResponse
} from "@/api/services/fake-order.service";
import {
  createFakeOrder,
  deleteFakeOrder,
  deliverFakeOrder,
  getShopOrders,
  getValidUsers,
  updateFakeOrder,
  getOrders
} from "@/api/services/fake-order.service";
import { IValidUserListResponse } from "@/interface/response/fake-order";
import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

const VALID_USERS_KEY = "validUsers";
const SHOP_ORDERS_KEY = "shopOrders";
const ORDERS_KEY = "orders";

// Get valid users
export const useGetValidUsers = (
  params: IValidUserParams
): UseQueryResult<IValidUserListResponse> => {
  return useQuery({
    queryKey: [VALID_USERS_KEY, params],
    queryFn: () => getValidUsers(params)
  });
};

// Get all orders
export const useGetOrders = (
  params: IOrderParams
): UseQueryResult<IOrderResponse> => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => getOrders(params)
  });
};

// Create fake order
export const useCreateFakeOrder = (): UseMutationResult<
  any,
  Error,
  ICreateFakeOrderPayload
> => {
  return useMutation({
    mutationFn: (payload: ICreateFakeOrderPayload) => createFakeOrder(payload),
  });
};

// Mark fake order as delivered
export const useDeliverFakeOrder = (): UseMutationResult<
  any,
  Error,
  string
> => {
  return useMutation({
    mutationFn: (id: string) => deliverFakeOrder(id),
  });
};

// Update fake order
export const useUpdateFakeOrder = (): UseMutationResult<
  any,
  Error,
  { orderId: string; payload: IUpdateFakeOrderPayload }
> => {
  return useMutation({
    mutationFn: ({ orderId, payload }) => updateFakeOrder(orderId, payload),
  });
};

// Delete fake order
export const useDeleteFakeOrder = (): UseMutationResult<any, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => deleteFakeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHOP_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [VALID_USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};
