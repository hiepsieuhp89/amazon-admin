export interface IUpdateDeliveryStageRequest {
  stage: number;
}

export interface IAddDelayMessageRequest {
  message: string;
  orderId?:string;
  delayTime?: string;
} 