import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { messaging } from 'firebase-admin';
import { config } from 'dotenv';

config();

@Injectable()
export class appLogger extends Logger {
  error(msg: string, trace: string) {
    super.error(msg, trace);
  }
}

@Injectable()
export class PushNotifier {
  private app: admin.app.App;
  private pushNotification: admin.messaging.Messaging;

  constructor() {
    this.app = admin.initializeApp();
    this.pushNotification = this.app.messaging();
  }

  async push(
    pushToken: string | Array<string>,
    data: Record<string, any>,
    notification: messaging.AndroidNotification,
  ) {
    const pushRequest: messaging.Message | messaging.MulticastMessage = {
      data,
      notification,
      token: pushToken,
    } as messaging.Message | messaging.MulticastMessage;

    if (typeof pushToken === 'string') {
      let resp = null;
      resp = await this.pushNotification.send(pushRequest as messaging.Message);
      console.log(resp);

      return resp;
    } else if (typeof pushToken === 'object') {
      let resp = null;
      resp = await this.pushNotification.sendMulticast(
        pushRequest as messaging.MulticastMessage,
      );
      console.log(resp);]

      return resp;
    }
  }
}
