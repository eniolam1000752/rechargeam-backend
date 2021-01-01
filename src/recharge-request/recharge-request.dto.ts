import { DebitOperation } from 'src/lib/constants';

export interface ISendRequest {
  amount: string;
  debitOperation: DebitOperation;
}
