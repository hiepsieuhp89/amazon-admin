export enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending",
}

export interface ICreateUser {
    email: string
    username: string
    password: string
    fullName: string
    phone?: string
    role?: string
    status?: UserStatus
    balance?: string
    fedexBalance?: string
    bankName?: string | null
    bankAccountNumber?: string | null
    bankAccountName?: string | null
    bankBranch?: string | null
    bankNumber?: string | null
    bankCode?: string | null
    address?: string | null
    city?: string
    country?: string
    ward?: string
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    isActive?: boolean
    isPhoneVerified?: boolean
    notes?: string
    metadata?: Record<string, any>
    sellerPackageId?: string
    spreadPackageId?: string 
    sellerPackageExpiry?: string
    spreadPackageExpiry?: string
    invitationCode?: string
    referralCode?: string | null
    shopName?: string
    shopAddress?: string
    countryId?: string | null
    stateId?: string | null
    cityId?: string | null
    districtId?: string | null
    postalCodeId?: string | null
    stars?: number
    reputationPoints?: number
    view?: number
}

export interface IUpdateUser {
    email?: string
    username?: string
    password?: string
    shopStatus?: string
    fullName?: string
    phone?: string
    role?: string
    status?: UserStatus
    balance?: string
    fedexBalance?: string
    isHaveLogTransaction?: boolean
    bankName?: string | null
    bankAccountNumber?: string | null
    bankAccountName?: string | null
    bankBranch?: string | null
    bankNumber?: string | null
    bankCode?: string | null
    address?: string | null
    city?: string
    district?: string
    ward?: string
    country?: string
    stars?: number
    reputationPoints?: number
    dateOfBirth?: string
    gender?: "male" | "female" | "other"
    isEmailVerified?: boolean
    isPhoneVerified?: boolean
    notes?: string
    metadata?: Record<string, any>
    shopName?: string
    shopAddress?: string
    sellerPackageExpiry?: string | null
    spreadPackageExpiry?: string | null
    invitationCode?: string
    referralCode?: string | null
    sellerPackageId?: string
    spreadPackageId?: string
    view?: number
    sellerPackage?: any
    spreadPackage?: any
    countryId?: string | null
    stateId?: string | null
    cityId?: string | null
    districtId?: string | null
    postalCodeId?: string | null
    isActive?: boolean
    isVerified?: boolean
    totalProducts?: number
    totalWithdrawn?: number
    totalShippingOrders?: number
    totalDeliveredOrders?: number
    transactionPassword?: string
    walletPassword?: string
    withdrawPassword?: string
    fedexPassword?: string
    totalProfit?: number
    idCardType?: string
    idCardNumber?: string
    idCardFrontImage?: string
    idCardBackImage?: string
    logoUrl?: string
}

