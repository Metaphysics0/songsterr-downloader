import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger';

interface TabMetadata {
  artist: string;
  title: string;
}

interface S3TabResult {
  buffer: ArrayBuffer;
  metadata: TabMetadata;
}

const getS3Client = () => {
  return new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || ''
    }
  });
};

const getBucketName = () => env.S3_BUCKET_NAME || '';

const buildKey = (songId: string | number): string => `tabs-v2/${songId}.gp`;

export const s3 = {
  async exists(songId: string | number): Promise<boolean> {
    try {
      const client = getS3Client();
      await client.send(
        new HeadObjectCommand({
          Bucket: getBucketName(),
          Key: buildKey(songId)
        })
      );
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      logger.error('S3 exists check failed', error);
      return false;
    }
  },

  async get(songId: string | number): Promise<S3TabResult | null> {
    try {
      const client = getS3Client();
      const response = await client.send(
        new GetObjectCommand({
          Bucket: getBucketName(),
          Key: buildKey(songId)
        })
      );

      if (!response.Body) {
        return null;
      }

      const buffer = await response.Body.transformToByteArray();

      return {
        buffer: buffer.buffer as ArrayBuffer,
        metadata: {
          artist: response.Metadata?.artist || '',
          title: response.Metadata?.title || ''
        }
      };
    } catch (error) {
      logger.error('S3 get failed', error);
      return null;
    }
  },

  async put(
    songId: string | number,
    buffer: ArrayBuffer,
    metadata: TabMetadata
  ): Promise<boolean> {
    try {
      const client = getS3Client();
      await client.send(
        new PutObjectCommand({
          Bucket: getBucketName(),
          Key: buildKey(songId),
          Body: Buffer.from(buffer),
          ContentType: 'application/gp',
          Metadata: {
            artist: metadata.artist,
            title: metadata.title
          }
        })
      );
      logger.info(`Stored tab ${songId} to S3`);
      return true;
    } catch (error) {
      logger.error('S3 put failed', error);
      return false;
    }
  }
};
