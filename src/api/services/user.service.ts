/* eslint-disable import/no-anonymous-default-export */
import { sendDelete, sendGet, sendPatch, sendPost } from "../apiClient"
import { ConfigUserEndPoint } from "./contants"
import type { ICreateUser, IUpdateUser } from "@/interface/request/user"
import type { IUserListResponse, IUserResponse } from "@/interface/response/user"

// Create a new user
export const createUser = async (payload: ICreateUser): Promise<IUserResponse> => {
  const res = await sendPost(ConfigUserEndPoint.BASE, payload)
  return res
}

// Get all users
export const getAllUsers = async (params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}): Promise<IUserListResponse> => {
  const res = await sendGet(ConfigUserEndPoint.BASE, params)
  return res
}

// Get user by ID
export const getUserById = async (id: string): Promise<IUserResponse> => {
  const res = await sendGet(ConfigUserEndPoint.GET_BY_ID(id))
  return res
}

// Update user
export const updateUser = async (id: string, payload: IUpdateUser): Promise<IUserResponse> => {
  const res = await sendPatch(ConfigUserEndPoint.UPDATE(id), payload)
  return res
}

// Delete user
export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const res = await sendDelete(ConfigUserEndPoint.DELETE(id))
  return res
}

