export const GetPresignedUrlResponseExample = {
    signedUrl: 'https://s3.amazonaws.com/your-bucket-name/your-file-name',
};

export const GetFileDetailResponseExample = {
    id: 1,
    originalName: 'originalName',
    storedName: 'StoreName',
    mimeType: 'image/png',
    extension: 'png',
    url: 'https://storage.googleapis.com/GCS_BUCKET/example/originalName',
    createdAt: '2023-11-14T04:33:05.948Z',
    updatedAt: '2023-11-14T04:33:05.948Z',
};

export const GetExportCsvFileDetailResponseExample = {
    id: 1,
    originalName: 'csv-file.csv',
    storedName: 'csv-file.csv',
    mimeType: 'text/csv',
    extension: 'csv',
    url: 'https://storage.googleapis.com/GCS_BUCKET/example/csv-file.csv',
    createdAt: '2023-11-14T04:33:05.948Z',
    updatedAt: '2023-11-14T04:33:05.948Z',
};
