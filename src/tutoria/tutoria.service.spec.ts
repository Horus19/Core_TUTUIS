import { Test, TestingModule } from '@nestjs/testing';
import { TutoriaService } from './tutoria.service';

describe('TutoriaService', () => {
  let service: TutoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TutoriaService],
    }).compile();

    service = module.get<TutoriaService>(TutoriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
