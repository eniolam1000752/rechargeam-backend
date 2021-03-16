import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Wallet } from 'src/db/entities/Wallet';
import { Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return 'This action adds a new wallet';
  }

  

  async findOne(customer: Customer) {
    try {
      return this.walletRepo.findOneOrFail({ where: { customer } });
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
