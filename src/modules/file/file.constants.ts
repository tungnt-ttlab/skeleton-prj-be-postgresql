export enum SupportFileExtension {
    PNG = 'png',
    JPEG = 'jpeg',
    JPG = 'jpg',
    MP3 = 'mp3',
    M4A = 'm4a',
    AIF = 'aif',
    WAV = 'wav',
    WMA = 'wma',
    AAC = 'aac',
    OGG = 'ogg',
    FLAC = 'flac',
    MP4 = 'mp4',
    MOV = 'mov',
    MKV = 'mkv',
    WEBM = 'webm',
    HEVC = 'hevc',
    GIF = 'gif',
    HEIC = 'heic',
    HEIF = 'heif',
    WEBP = 'webp',
}

export enum FileResourceType {
    AVATAR = 'avatar',
    GALLERY = 'gallery',
    VOICE = 'voice',
    BACKGROUND = 'background',
}

export enum SignUrlAction {
    WRITE = 'write',
    READ = 'read',
}

export enum SignUrlUploadCommandType {
    POST = 'post',
    PUT = 'put',
}

export const ImageExtensions = [
    SupportFileExtension.PNG,
    SupportFileExtension.JPEG,
    SupportFileExtension.JPG,
    SupportFileExtension.GIF,
    SupportFileExtension.HEIC,
    SupportFileExtension.HEIF,
    SupportFileExtension.WEBP,
];

export const VideoExtensions = [
    SupportFileExtension.MP4,
    SupportFileExtension.MOV,
    SupportFileExtension.MKV,
    SupportFileExtension.WEBM,
    SupportFileExtension.HEVC,
];

export const AudioExtensions = [
    SupportFileExtension.MP3,
    SupportFileExtension.M4A,
    SupportFileExtension.AIF,
    SupportFileExtension.WAV,
    SupportFileExtension.WMA,
    SupportFileExtension.AAC,
    SupportFileExtension.OGG,
    SupportFileExtension.FLAC,
];

export enum FileSize {
    THUMBNAIL = 'thumbnail',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export const MAX_FILE_SIZE = 2048; // 2GB default max size
export enum FileMediaType {
    VIDEO = 'video',
    IMAGE = 'image',
    AUDIO = 'audio',
}

export const VideoThumbnailExtension = 'jpg';
export const OutputVideoExtension = 'mp4';
export const OutputAudioExtension = 'mp3';

export enum FileVersion {
    THUMBNAIL = 'thumbnail',
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

export const FileVersionSizes = {
    [FileVersion.THUMBNAIL]: { width: 150, quality: 90 },
    [FileVersion.SMALL]: { width: 360, quality: 95 },
    [FileVersion.MEDIUM]: { width: 720, quality: 90 },
    [FileVersion.LARGE]: { width: 1280, quality: 90 },
};
