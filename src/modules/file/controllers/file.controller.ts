import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPresignedUrlResponseExample } from '../file.swagger';
import { BaseController } from '@/common/base/base.controller';
import { SuccessResponse } from '@/common/helpers/response';
import { JoiValidationPipe } from '@/common/pipe/joi.validation.pipe';
import {
    ApiResponseError,
    SwaggerApiType,
    ApiResponseSuccess,
} from '@/common/services/swagger.service';
import { SignUrlUploadCommandType, SignUrlAction } from '../file.constants';
import { SignedUrlQueryDto } from '../file.dto';
import { generateFileInfo } from '../files.helper';
import { AwsS3StorageService } from '../services/aws-s3-storage.service';

@ApiTags('Common File APIs')
@ApiBearerAuth()
@Controller('files')
export class FileController extends BaseController {
    constructor(private readonly awsS3StorageService: AwsS3StorageService) {
        super();
    }

    @ApiOperation({ summary: 'Get signed url from S3 to upload file' })
    @ApiResponseError([SwaggerApiType.GET_DETAIL])
    @ApiResponseSuccess(GetPresignedUrlResponseExample)
    @Get('/signed-url')
    async getSignedUrl(
        @Query(new JoiValidationPipe())
        query: SignedUrlQueryDto,
    ) {
        try {
            const { storedName, s3Key, filePath } = generateFileInfo(query);
            let signedUrl;
            if (query.uploadCommandType === SignUrlUploadCommandType.PUT) {
                signedUrl = await this.awsS3StorageService.getSignedUrlNew({
                    resourceType: query.resourceType,
                    filePath,
                    action: SignUrlAction.WRITE,
                });
            } else {
                signedUrl = await this.awsS3StorageService.getSignedUrl({
                    resourceType: query.resourceType,
                    filePath,
                    action: SignUrlAction.WRITE,
                });
            }

            return new SuccessResponse({
                signedUrl,
                s3Key,
                storedName,
            });
        } catch (error) {
            this.handleError(error);
        }
    }
}
