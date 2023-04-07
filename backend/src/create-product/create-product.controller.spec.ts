import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductController } from './create-product.controller';

describe('CreateProductController', () => {
  let controller: CreateProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateProductController],
    }).compile();

    controller = module.get<CreateProductController>(CreateProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
