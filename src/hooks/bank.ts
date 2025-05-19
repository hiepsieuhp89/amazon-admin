import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { getBanks } from "@/api/services/bank.service"
import type { IBankListResponse } from "@/interface/response/bank"

const BANKS_KEY = "banks"

export const useGetBanks = (): UseQueryResult<IBankListResponse> => {
  return useQuery({
    queryKey: [BANKS_KEY],
    queryFn: () => getBanks(),
  })
} 