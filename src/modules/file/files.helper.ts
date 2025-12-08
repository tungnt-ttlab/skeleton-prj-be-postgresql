import { v4 as uuidv4 } from 'uuid';
import { FileResourceType } from './file.constants';
import { SignedUrlQueryDto } from './file.dto';

export const PREFIX_PATH_MAP_RESOURCE_TYPE: Record<FileResourceType, string> = {
    [FileResourceType.AVATAR]: 'avatar',
    [FileResourceType.GALLERY]: 'gallery',
    [FileResourceType.VOICE]: 'voice',
    [FileResourceType.BACKGROUND]: 'background',
};

export const generateFileInfo = (query: SignedUrlQueryDto) => {
    const s3Key = `${PREFIX_PATH_MAP_RESOURCE_TYPE[query.resourceType]}/${process.env.S3_GLACIER_DEEP_ARCHIVE}`;
    const storedName = `${uuidv4()}.${query.originalName.split('.').pop()}`;
    return { filePath: `${s3Key}/${storedName}`, s3Key, storedName };
};

export function appendSizeToFilename(filename: string, size: string) {
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
        return `${filename}_${size}`; // Extension is not found
    }

    const namePart = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex);

    return `${namePart}_${size}${extension}`;
}
