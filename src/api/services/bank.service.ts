import { sendGet } from "../apiClient"
import { ConfigBankLookupEndPoint } from "./contants"
import type { IBankListResponse } from "@/interface/response/bank"

export const getBanks = async (): Promise<IBankListResponse> => {
  const res = await sendGet(ConfigBankLookupEndPoint.BASE)
  return res
} 