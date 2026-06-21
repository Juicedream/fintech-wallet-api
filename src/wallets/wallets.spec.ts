import { Test, TestingModule } from '@nestjs/testing';
import { Wallets } from './wallets';

describe('Wallets', () => {
  let provider: Wallets;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Wallets],
    }).compile();

    provider = module.get<Wallets>(Wallets);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
