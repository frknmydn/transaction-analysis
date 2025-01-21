import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MerchantAnalysisModule } from './merchant-analysis/merchant-analysis.module';
import { PatternAnalysisModule } from './pattern-analysis/pattern-analysis.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MerchantAnalysisModule,
    PatternAnalysisModule,
    UploadModule,
  ],
})
export class AppModule {}
