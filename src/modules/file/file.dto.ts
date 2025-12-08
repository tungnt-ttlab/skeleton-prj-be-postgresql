import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import { JoiValidate } from '@/common/decorators/validator.decorator';
import Joi from '@/plugins/joi';
import { ApiProperty } from '@nestjs/swagger';
import { FileResourceType, SignUrlUploadCommandType } from './file.constants';

export class SignedUrlQueryDto {
    @ApiProperty({
        enum: FileResourceType,
        default: FileResourceType.AVATAR,
    })
    @JoiValidate(
        Joi.string()
            .valid(...Object.values(FileResourceType))
            .required(),
    )
    resourceType: FileResourceType;

    @ApiProperty({
        type: String,
        maxLength: INPUT_TEXT_MAX_LENGTH,
        default: 'file.png',
    })
    @JoiValidate(Joi.string().max(INPUT_TEXT_MAX_LENGTH).required())
    originalName: string;

    @ApiProperty({
        enum: SignUrlUploadCommandType,
        default: SignUrlUploadCommandType.POST,
    })
    @JoiValidate(
        Joi.string()
            .valid(...Object.values(SignUrlUploadCommandType))
            .default(SignUrlUploadCommandType.POST),
    )
    uploadCommandType: SignUrlUploadCommandType = SignUrlUploadCommandType.POST;
}
