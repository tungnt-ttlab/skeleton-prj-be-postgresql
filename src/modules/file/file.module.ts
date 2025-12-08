import { Module } from '@nestjs/common';
import { FileController } from './controllers/file.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthHelper } from '../auth/auth.helper';
import { AwsS3StorageService } from './services/aws-s3-storage.service';
@Module({
    imports: [],
    controllers: [FileController],
    providers: [AwsS3StorageService, AuthHelper, JwtService, ConfigService],
    exports: [AwsS3StorageService],
})
export class FileModule {}
