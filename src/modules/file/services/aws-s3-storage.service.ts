import {
    GetObjectCommand,
    S3Client,
    ListObjectsV2Command,
    DeleteObjectsCommand,
    PutObjectCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Injectable } from '@nestjs/common';
import {
    FileResourceType,
    FileSize,
    MAX_FILE_SIZE,
    SignUrlAction,
} from '../file.constants';
import { ConfigService } from '@nestjs/config';
import { appendSizeToFilename } from '../files.helper';
import ConfigKey from '@/common/config/config-key';
import { BaseService } from '@/common/base/base.service';

@Injectable()
export class AwsS3StorageService extends BaseService {
    private readonly client: S3Client;
    private readonly maxFileSize: number = MAX_FILE_SIZE * 1024 * 1024; // 2GB default max size

    defaultBucketName: string;

    constructor(private readonly configService: ConfigService) {
        super();
        const clientConfig = {
            region: this.configService.get(ConfigKey.AWS_REGION),
            credentials: {
                accessKeyId: this.configService.get(
                    ConfigKey.AWS_ACCESS_KEY_ID,
                ),
                secretAccessKey: this.configService.get(
                    ConfigKey.AWS_SECRET_ACCESS_KEY,
                ),
            },
        };
        this.client = new S3Client(clientConfig);
        this.defaultBucketName = this.configService.get(
            ConfigKey.AWS_S3_BUCKET,
        );
    }

    async getSignedUrl(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        action: SignUrlAction;
        maxFileSize?: number;
    }) {
        try {
            const {
                bucketName,
                filePath,
                action,
                resourceType,
                maxFileSize = this.maxFileSize,
            } = options;

            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            if (action === SignUrlAction.WRITE) {
                // Use createPresignedPost for uploads
                const expires = this.configService.get(
                    ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                );

                const { url, fields } = await createPresignedPost(
                    this.client as any,
                    {
                        Bucket: currentBucketName,
                        Key: filePath,
                        Conditions: [
                            ['content-length-range', 0, maxFileSize],
                            [
                                'starts-with',
                                '$key',
                                filePath.split('.').slice(0, -1).join('.') +
                                    '.',
                            ],
                        ],
                        Expires: expires,
                    },
                );

                return { url, fields };
            } else {
                // Use getSignedUrl for downloads
                const command = new GetObjectCommand({
                    Bucket: currentBucketName,
                    Key: filePath,
                });

                const expires = this.configService.get(
                    ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                );

                const url = await getSignedUrl(this.client as any, command, {
                    expiresIn: expires,
                });

                return { url };
            }
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService getSignedUrl: ${error}`,
            );
            throw error;
        }
    }

    async getSignedUrlNew(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        action: SignUrlAction;
    }) {
        try {
            const { bucketName, filePath, action, resourceType } = options;

            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            if (action === SignUrlAction.WRITE) {
                // Use PutObjectCommand with getSignedUrl for uploads
                const command = new PutObjectCommand({
                    Bucket: currentBucketName,
                    Key: filePath,
                });

                const expires = this.configService.get(
                    ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                );

                const url = await getSignedUrl(this.client as any, command, {
                    expiresIn: expires,
                });

                return { url };
            } else {
                // Use getSignedUrl for downloads (same as original)
                const command = new GetObjectCommand({
                    Bucket: currentBucketName,
                    Key: filePath,
                });

                const expires = this.configService.get(
                    ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                );

                const url = await getSignedUrl(this.client as any, command, {
                    expiresIn: expires,
                });

                return { url };
            }
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService getSignedUrlNew: ${error}`,
            );
            throw error;
        }
    }

    async getSignedUrlMultipart(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        action: SignUrlAction;
        partNumber?: number;
        uploadId?: string;
    }) {
        try {
            const {
                bucketName,
                filePath,
                action,
                resourceType,
                partNumber,
                uploadId,
            } = options;
            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            if (action === SignUrlAction.WRITE) {
                if (partNumber && uploadId) {
                    // Upload part
                    const command = new UploadPartCommand({
                        Bucket: currentBucketName,
                        Key: filePath,
                        PartNumber: partNumber,
                        UploadId: uploadId,
                    });

                    const expires = this.configService.get(
                        ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                    );

                    const url = await getSignedUrl(
                        this.client as any,
                        command,
                        {
                            expiresIn: expires,
                        },
                    );

                    return { url };
                } else {
                    // Initiate multipart upload
                    const command = new CreateMultipartUploadCommand({
                        Bucket: currentBucketName,
                        Key: filePath,
                    });

                    const expires = this.configService.get(
                        ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                    );

                    const url = await getSignedUrl(
                        this.client as any,
                        command,
                        {
                            expiresIn: expires,
                        },
                    );

                    return { url };
                }
            } else {
                // READ action - same as current
                const command = new GetObjectCommand({
                    Bucket: currentBucketName,
                    Key: filePath,
                });

                const expires = this.configService.get(
                    ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND,
                );

                const url = await getSignedUrl(this.client as any, command, {
                    expiresIn: expires,
                });

                return { url };
            }
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService getSignedUrlNewMultipart: ${error}`,
            );
            throw error;
        }
    }

    async initiateMultipartUpload(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
    }) {
        try {
            const { bucketName, filePath, resourceType } = options;
            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            const command = new CreateMultipartUploadCommand({
                Bucket: currentBucketName,
                Key: filePath,
            });

            const response = await this.client.send(command);

            return {
                uploadId: response.UploadId,
                key: response.Key,
                bucket: response.Bucket,
            };
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService initiateMultipartUpload: ${error}`,
            );
            throw error;
        }
    }

    async uploadPart(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        partNumber: number;
        uploadId: string;
        body: Buffer | Uint8Array | string;
    }) {
        try {
            const {
                bucketName,
                filePath,
                resourceType,
                partNumber,
                uploadId,
                body,
            } = options;
            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            const command = new UploadPartCommand({
                Bucket: currentBucketName,
                Key: filePath,
                PartNumber: partNumber,
                UploadId: uploadId,
                Body: body,
            });

            const response = await this.client.send(command);

            return {
                etag: response.ETag,
                partNumber,
            };
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService uploadPart: ${error}`,
            );
            throw error;
        }
    }

    async completeMultipartUpload(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        uploadId: string;
        parts: Array<{ ETag: string; PartNumber: number }>;
    }) {
        try {
            const { bucketName, filePath, resourceType, uploadId, parts } =
                options;
            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            const command = new CompleteMultipartUploadCommand({
                Bucket: currentBucketName,
                Key: filePath,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts,
                },
            });

            const response = await this.client.send(command);

            return {
                location: response.Location,
                key: response.Key,
                bucket: response.Bucket,
                etag: response.ETag,
            };
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService completeMultipartUpload: ${error}`,
            );
            throw error;
        }
    }

    async abortMultipartUpload(options: {
        resourceType: FileResourceType;
        bucketName?: string;
        filePath: string;
        uploadId: string;
    }) {
        try {
            const { bucketName, filePath, resourceType, uploadId } = options;
            const currentBucketName =
                bucketName ?? this.getBucketName(resourceType);

            const command = new AbortMultipartUploadCommand({
                Bucket: currentBucketName,
                Key: filePath,
                UploadId: uploadId,
            });

            await this.client.send(command);

            return { success: true };
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService abortMultipartUpload: ${error}`,
            );
            throw error;
        }
    }

    async listFiles(
        options: { bucketName?: string; prefix?: string } = {},
    ): Promise<string[]> {
        const { bucketName = this.defaultBucketName, prefix } = options;

        try {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix, // Filter by directory (if any)
            });

            const response = await this.client.send(command);

            if (!response.Contents) {
                return [];
            }

            return response.Contents.map((file) => file.Key || '');
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService listFiles: ${error}`,
            );
            throw error;
        }
    }

    async listFilesWithDetails(
        options: { bucketName?: string; prefix?: string } = {},
    ): Promise<any[]> {
        const { bucketName = this.defaultBucketName, prefix } = options;
        let continuationToken: string | undefined;
        const allFiles: any[] = [];

        try {
            do {
                const command = new ListObjectsV2Command({
                    Bucket: bucketName,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                });

                const response = await this.client.send(command);
                if (response.Contents) {
                    allFiles.push(
                        ...response.Contents.map((file) => ({
                            key: file.Key,
                            size: file.Size, // File size (bytes)
                            lastModified: file.LastModified, // Last modified time
                        })),
                    );
                }
                continuationToken = response.NextContinuationToken;
            } while (continuationToken);

            return allFiles;
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService listFilesWithDetails: ${error}`,
            );
            throw error;
        }
    }

    async deleteFilesByPaths(options: {
        bucketName?: string;
        filePaths: string[];
    }): Promise<void> {
        try {
            const {
                bucketName = this.defaultBucketName,
                filePaths: _filePaths,
            } = options;

            if (!_filePaths.length) {
                return;
            }
            const filePaths = _filePaths.flatMap((filePath) => {
                return [
                    ...Object.values(FileSize).map((size) => {
                        return appendSizeToFilename(filePath, size as string);
                    }),
                    filePath,
                ];
            });
            const command = new DeleteObjectsCommand({
                Bucket: bucketName,
                Delete: {
                    Objects: filePaths.map((filePath) => ({ Key: filePath })),
                },
            });

            await this.client.send(command);
        } catch (error) {
            this.logger.error(
                `Error in AwsS3StorageService deleteFilesByPaths: ${error}`,
            );
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getBucketName(resourceType: FileResourceType) {
        return this.defaultBucketName;
    }
}
