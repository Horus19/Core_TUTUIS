import { Test, TestingModule } from '@nestjs/testing';
import { TutoriaController } from './tutoria.controller';
import { TutoriaService } from './tutoria.service';

describe('TutoriaController', () => {
  let controller: TutoriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutoriaController],
      providers: [TutoriaService],
    }).compile();

    controller = module.get<TutoriaController>(TutoriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
