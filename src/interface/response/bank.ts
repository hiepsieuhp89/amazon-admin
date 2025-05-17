export interface IBank {
  id: string;
  code: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface IBankListResponseData {
  data: IBank[];
}

export interface IApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  errors: null | any;
  timestamp: string;
}

export type IBankListResponse = IApiResponse<IBankListResponseData>; 