import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiConsumes, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }
  
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File upload and analysis result',
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const results = await this.uploadService.parseAndStore(file);
    return results;
  }
}