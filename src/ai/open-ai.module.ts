import { Module } from '@nestjs/common';
import { OpenaiService } from './open-ai.service';

@Module({
  providers: [OpenaiService],
  exports: [OpenaiService],   
})
export class OpenaiModule {}