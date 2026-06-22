import { PartialType } from '@nestjs/mapped-types';
import { TopUpWalletDto } from './top-up-wallet.dto';
export class WithdrawFromWalletDto extends PartialType(TopUpWalletDto) {}
