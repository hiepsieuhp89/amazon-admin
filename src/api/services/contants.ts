export const ConfigAuthEndPoint = {
  LOGIN: "/auth/admin-login",
  PROFILE: "/auth/profile",
  REGISTER: "/auth/register",
  FORGOT_PASSSWORD: "/auth/forgot-password",
  RESET_PASSSWORD: "/auth/reset-password",
  ME: "/auth/me",
  WITH_DRAWAL_CONDITION: "/auth/getWithdrawalCondition",
  UPDATE_WITHDRAWAL_PASSWORD: "/auth/updateWithdrawPassword",
  CHANGE_PASSSWORD: "/auth/change-password",
  UPDATE_USER_INFO: "/auth/updateUserInfo",
  GET_BALANCE: "/auth/getBalance",
  STATISTICS_SUMMARY: "/payments/statistics-summary",
  STATISTICS_DETAIL: "/payments/statistics-detail",
  STATISTICS_DEPOSIT_DETAIL: "/payments/statistics-deposit-detail",
  STATISTICS_WITHDRAWAL_DETAIL: "/payments/statistics-withdrawal-detail",
  STATISTICS_TOP_DEPOSITORS: "/payments/top-depositors",
  TOTAL_WITHDRAWAL_AMOUNT_8_DAYS: "/payments/total-withdrawal-amount-8-days",
  TOTAL_DEPOSIT_AMOUNT_8_DAYS: "/payments/total-deposit-amount-8-days",
};

export const ConfigCategoryEndPoint = {
  BASE: "/admin/categories",
  GET_BY_ID: (id: string) => `/admin/categories/${id}`,
  UPDATE: (id: string) => `/admin/categories/${id}`,
  DELETE: (id: string) => `/admin/categories/${id}`,
  GET_DESCENDANTS: (id: string) => `/admin/categories/${id}/descendants`,
}


export const ConfigSellerPackageEndPoint = {
  BASE: "/admin/seller-packages",
  GET_BY_ID: (id: string) => `/admin/seller-packages/${id}`,
  UPDATE: (id: string) => `/admin/seller-packages/${id}`,
  DELETE: (id: string) => `/admin/seller-packages/${id}`,
}

export const ConfigImageEndPoint = {
  BASE: "/images",
  UPLOAD: "/upload",
  GET_BY_ID: (id: string) => `/images/${id}`,
  UPDATE: (id: string) => `/images/${id}`,
  DELETE: (id: string) => `/images/${id}`,
  GET_PRODUCT_IMAGES: (productId: string) => `/images/product/${productId}`,
  DELETE_PRODUCT_IMAGE_LINK: (id: string) => `/images/product-image/${id}`,
  GET_IMAGE_FILE: (filename: string) => `/images/file/${filename}`,
};

export const ConfigSpreadPackageEndPoint = {
  BASE: "/admin/spread-packages",
  GET_BY_ID: (id: string) => `/admin/spread-packages/${id}`,
  UPDATE: (id: string) => `/admin/spread-packages/${id}`,
  DELETE: (id: string) => `/admin/spread-packages/${id}`,
}

export const ConfigProductEndPoint = {
  BASE: "/admin/products",
  GET_BY_ID: (id: string) => `/admin/products/${id}`,
  UPDATE: (id: string) => `/admin/products/${id}`,
  DELETE: (id: string) => `/admin/products/${id}`,
};


export const ConfigUserEndPoint = {
  BASE: "/admin/users",
  GET_BY_ID: (id: string) => `/admin/users/${id}`,
  UPDATE: (id: string) => `/admin/users/${id}`,
  DELETE: (id: string) => `/admin/users/${id}`,
};

export const ConfigUserIpHistoryEndPoint = {
  BASE: "/admin/user-ip-history",
};

export const ConfigTransactionEndPoint = {
  BASE: "/transaction",
  HISTORY: "/transaction/admin/history",
  RECHARGE: "/transaction/recharge",
  WITHDRAW: "/transaction/withdraw",
  ADMIN_WITHDRAWALS: "/withdrawals/admin",
};

export const ConfigActionLogEndPoint = {
  BASE: "/action-logs",
  USER_LOGS: (userId: string) => `/action-logs?userAgent=${userId}`,
};

export const ConfigFakeOrderEndPoint = {
  BASE: "/admin/fake-orders",
  VALID_USERS: "/admin/fake-orders/valid-users",
  DELIVER: (id: string) => `/admin/fake-orders/${id}/deliver`,
  SHOP_ORDERS: "/admin/fake-orders/shop-orders",
};

export const ConfigShopProductEndPoint = {
  BASE: "/admin/shop-products",
  GET_BY_ID: (id: string) => `/admin/shop-products/${id}`,
  UPDATE: (id: string) => `/admin/shop-products/${id}`,
  DELETE: (id: string) => `/admin/shop-products/${id}`,
};

export const ConfigCountryEndPoint = {
  BASE: "/admin/countries",
  GET_BY_ID: (id: string) => `/admin/countries/${id}`
}

export const ConfigStateEndPoint = {
  BASE: "/admin/states",
  GET_BY_ID: (id: string) => `/admin/states/${id}`
}

export const ConfigCityEndPoint = {
  BASE: "/admin/cities",
  GET_BY_ID: (id: string) => `/admin/cities/${id}`
}

export const ConfigDistrictEndPoint = {
  BASE: "/admin/districts",
  GET_BY_ID: (id: string) => `/admin/districts/${id}`
}

export const ConfigPostalCodeEndPoint = {
  BASE: "/admin/postal-codes",
  GET_BY_ID: (id: string) => `/admin/postal-codes/${id}`
}

export const ConfigAdminChatEndPoint = {
  SEND_MESSAGE: (userId: string, shopId: string) => `/admin/chat/user/${userId}/shop/${shopId}`,
  GET_MESSAGES: (userId: string, shopId: string) => `/admin/chat/user/${userId}/shop/${shopId}`,
  MARK_AS_READ: (messageId: string) => `/admin/chat/${messageId}/read`,
  DELETE_MESSAGE: (messageId: string) => `/admin/chat/${messageId}`,
  GET_SHOP_USERS: (shopId: string) => `/admin/chat/shop/${shopId}/users`,
}

export const ConfigFakeReviewEndPoint = {
  BASE: '/admin/fake-reviews',
  GET_USER_ORDERS: (userId: string) => `/admin/fake-reviews/user-orders?userId=${userId}`
}

export const ConfigNotificationEndPoint = {
  BASE: "/admin/notifications/system",
  GET_BY_ID: (id: string) => `/admin/notifications/system/${id}`,
  DELETE: (id: string) => `/admin/notifications/system/${id}`,
  MARK_AS_READ: (id: string) => `/admin/notifications/system/${id}/read`,
};

export const ConfigMaintenanceModeEndPoint = {
  BASE: "/maintenance-mode",
};

export const ConfigSettingsEndPoint = {
  BASE: "/admin/settings",
  GET_SETTINGS: "/admin/settings",
  UPDATE_SETTINGS: "/admin/settings",
};

export const ConfigProductReviewEndPoint = {
  BASE: "/product-reviews",
  GET_BY_ID: (id: string) => `/product-reviews/${id}`,
  DELETE: (id: string) => `/product-reviews/${id}`,
};

export const ConfigEndPoint = {
  BASE: "/config",
  GET_BY_KEY: (key: string) => `/config/${key}`,
  UPDATE: (key: string) => `/config/${key}`,
  DELETE: (key: string) => `/config/${key}`,
};

export const ConfigOrderEndPoint = {
  BASE: "/admin/orders",
  GET_BY_ID: (id: string) => `/admin/orders/${id}`,
  UPDATE_DELIVERY_STAGE: (id: string) => `/admin/orders/${id}/delivery-stage`,
  GET_DELIVERY_STAGES: "/admin/orders/delivery-stages",
  ADD_DELAY_MESSAGE: (orderId: string) => `/admin/orders/${orderId}/delay`,
};

export const ConfigInvitationCodeEndPoint = {
  BASE: "/invitation-codes",
  CREATE: "/invitation-codes",
  MY_CODES: "/invitation-codes/my-codes",
  GET_BY_ID: (id: string) => `/invitation-codes/${id}`,
  DEACTIVATE: "/invitation-codes/deactivate",
};

export const ConfigEmailTemplateEndPoint = {
  BASE: "/email-templates",
  GET_BY_TYPE: (type: string) => `/email-templates/${type}`,
  UPDATE: (type: string) => `/email-templates/${type}`,
  SEND: "/email/send",
};

export const ConfigBankLookupEndPoint = {
  BASE: "/bank-lookup/banks",
}