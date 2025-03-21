export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending",
}

export interface IAddress {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    isDefault?: boolean
}

export interface ICreateUser {
    email: string
    username: string
    password: string
    fullName: string
    phone?: string
    role?: string
    status?: UserStatus
    balance?: number
    addresses?: IAddress[]
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    isActive?: boolean
    isPhoneVerified?: boolean
    notes?: string
    metadata?: Record<string, any>
}

export interface IUpdateUser {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
    phoneNumber?: string
    role?: string
    status?: UserStatus
    avatar?: string
    addresses?: IAddress[]
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    isEmailVerified?: boolean
    isPhoneVerified?: boolean
    notes?: string
    metadata?: Record<string, any>
}

