import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class appLogger extends Logger {
  error(msg: string, trace: string) {
    super.error(msg, trace);
  }
}

@Injectable()
export class pushNotifier {
  constructor() {}

  push() {}
}
