import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
config();

export interface TransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class Paystack {
  public static PAYSTACK_BASE_URL = 'https://api.paystack.co/';
  private static paths = {
    getBanks: `bank`,
    initTransaction: 'transaction/initialize',
    createPlan: 'plan',
    createSubAccount: 'subaccount',
    getSubAccount: 'subaccount/',
    verifyAcc: 'bank/resolve',
  };

  private static defaultHeader = {
    // Accept: 'application/json',
    Authorization: `Bearer ${process.env.PAYSTACK_SECRETE}`,
    'Content-Type': 'application/json',
    // 'Cache-Control': 'no-cache',
  };

  constructor() {}

  static async getBanks() {
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.getBanks}`,
        { country: 'nigeria' },
        'GET',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async createTransaction(arg: {
    amount: number;
    payerEmail: string;
    transactionRef?: string;
    planCode?: string;
    callbackUrl?: string;
  }) {
    const { amount, payerEmail, transactionRef, planCode, callbackUrl } = arg;
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.initTransaction}`,
        {
          amount,
          email: payerEmail,
          reference: transactionRef,
          callback_url: callbackUrl,
          plan: planCode,
        },
        'POST',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async payMerchant(arg: {
    amount: number;
    payerEmail: string;
    transactionRef?: string;
    planCode?: string;
    callbackUrl?: string;
    chargeAmount: number;
    merchantSubAccountCode: string;
  }) {
    const {
      amount,
      payerEmail,
      transactionRef,
      planCode,
      callbackUrl,
      merchantSubAccountCode,
      chargeAmount,
    } = arg;
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.initTransaction}`,
        {
          amount,
          email: payerEmail,
          reference: transactionRef,
          callback_url: callbackUrl,
          plan: planCode,
          subaccount: merchantSubAccountCode,
          transaction_charge: chargeAmount,
        },
        'POST',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async createSubAccount(arg: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge?: number;
    description?: string;
  }) {
    const {
      business_name,
      settlement_bank,
      account_number,
      percentage_charge,
      description,
    } = arg;
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.createSubAccount}`,
        {
          business_name,
          settlement_bank,
          account_number,
          percentage_charge,
          description,
        },
        'POST',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async createPlan(arg: {
    name: string;
    amount: number;
    interval:
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'biannually'
      | 'annually';
  }) {
    const { name, amount, interval } = arg;
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.createPlan}`,
        {
          name,
          amount,
          interval,
        },
        'POST',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async updateSubAccount(arg: {
    code: string;
    settlement_bank: string;
    account_number: string;
  }) {
    const { code, settlement_bank, account_number } = arg;
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.createSubAccount}/${code}`,
        {
          settlement_bank,
          account_number,
        },
        'PUT',
        { id_or_code: code },
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  static async getSubAccount() {}

  static async verifyAccountCredentials({ bankCode, accountNumber }) {
    try {
      return await this.request(
        `${this.PAYSTACK_BASE_URL}${this.paths.verifyAcc}`,
        { bank_code: bankCode, account_number: accountNumber },
        'GET',
      );
    } catch (exp) {
      throw new InternalServerErrorException(null, 'Request processing Error');
    }
  }

  private static request(
    url,
    payload,
    method: 'POST' | 'GET' | 'PUT',
    header?: Record<string, any>,
  ) {
    console.log('method: ', method);
    console.log('payload: ', payload);
    console.log('header: ', Object.assign(this.defaultHeader, header));

    if (/GET/g.test(method)) {
      const genUrl = () => {
        const payloadKeys = Object.keys(payload);
        return payloadKeys.length === 0
          ? url
          : payloadKeys.reduce(
              (cum, index, i) =>
                `${cum}${index}=${payload[index]}${
                  i === payloadKeys.length - 1 ? '' : '&'
                }`,
              `${url}?`,
            );
      };

      url = genUrl();
      console.log('URL: ', url);
      return axios({
        url,
        method,
        headers: Object.assign(this.defaultHeader, header),
        timeout: 40000,
      }).then((jsonResponse) => {
        console.log(`%c RESPONSE OF ${url}: `, 'green');
        console.log(jsonResponse.data);
        return jsonResponse?.data;
      });
    } else if (method === 'PUT') {
      console.log('URL: ', url);
      return axios({
        url,
        method,
        headers: Object.assign(this.defaultHeader, header),
        data: payload,
        timeout: 40000,
      }).then((jsonResponse) => {
        console.log(`%c RESPONSE OF ${url}: `, 'green');
        console.log(jsonResponse?.data);
        return jsonResponse?.data;
      });
    } else {
      console.log('URL: ', url);
      return axios({
        url,
        method,
        headers: Object.assign(this.defaultHeader, header),
        data: payload,
        timeout: 40000,
      }).then((jsonResponse) => {
        console.log(`%c RESPONSE OF ${url}: `, 'green');
        console.log(jsonResponse?.data);
        return jsonResponse?.data;
      });
    }
  }
}
