enum DebitOperation {
  AIRTIME = 'AIRTIME',
  DATA = 'DATA',
}

enum MobileOperators {
  DATA = 'MTN',
  _9MOBILE = '9MOBILE',
  GLO = 'GLO',
  AIRTEL = 'AIRTEL',
}

enum USSDSchemaAction {
  BALANCE = 'BALANCE',
  DEBIT = 'DEBIT',
}

export class getSettingsReq {
  type?: 'all' | 'ussd' | null;
}
export class saveSettingsReq {
  processors?: MobileOperators[];
  ussdSchemas?: {
    id?: number;
    processor: MobileOperators;
    ussdCodeFormat: string;
    debitOperation: DebitOperation;
    ussdAction: USSDSchemaAction;
  };
}
