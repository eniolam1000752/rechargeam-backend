import { Injectable } from '@nestjs/common';

@Injectable()
class AuthService {
  loginList: Array<string> = [];
}

export { AuthService };
