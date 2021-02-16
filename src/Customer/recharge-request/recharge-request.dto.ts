import { DebitOperation, MobileOperators } from 'src/lib/constants';

export interface ISendRequest {
  amount: string;
  debitOperation: DebitOperation;
  phoneNumber: string;
  processor: MobileOperators;
}

export interface IGetReqQueryParam {
  type?: 'all' | null;
}
