import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { isEmpty } from 'lodash-es';
import { logger } from '$lib/utils/logger';
import { env } from '$env/dynamic/private';
import { CLOUDFRONT_S3_BASE_URL } from '$lib/constants';

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  AWS_S3_BUCKET_NAME
} = env;

export class S3Repository {
  client: S3Client;

  constructor() {
    ensureAllEnvironmentVariablesAreLoaded();

    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_ACCESS_KEY_SECRET
      }
    });
  }

  async write({ fileName, artist, data, key }: WriteToS3Args): Promise<string> {
    const uploadCommand = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
      Body: data,
      ACL: 'public-read'
    });
    try {
      await this.client.send(uploadCommand);
      return this.getCloudfrontUrl.forTab(fileName, artist);
    } catch (error) {
      logger.error('error uploading to s3', error);
      return '';
    }
  }

  async head(key: string): Promise<string> {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key
    });
    try {
      const response = await this.client.send(headObjectCommand);
      if (response) return key;

      return '';
    } catch (error: any) {
      if (error.name === this.OBJECT_NOT_FOUND_ERROR_NAME) {
        logger.error('S3 HeadObjectCommand miss', `for key: ${key}`);
      }

      return '';
    }
  }

  async upsert({
    fileName,
    artist,
    data,
    key
  }: {
    artist: string;
    fileName: string;
    data: PutObjectCommandInput['Body'];
    key: string;
  }): Promise<string> {
    const existingLink = await this.head(key);
    if (existingLink) {
      logger.log(`already stored in S3`);
      return existingLink;
    }
    return this.write({ fileName, artist, data, key });
  }

  ensureCloudfrontDomain(url?: string) {
    if (!url) return;

    const publicS3BucketRegex =
      /^https:\/\/songsterr-tabs\.s3\.amazonaws\.com\/(.+)$/;
    const match = url.match(publicS3BucketRegex);

    if (match) {
      const path = match[1];
      return `${CLOUDFRONT_S3_BASE_URL}/${path}`;
    }

    return url;
  }

  public getCloudfrontUrl = {
    forTab: (fileName: string, artist: string): string => {
      return [
        CLOUDFRONT_S3_BASE_URL,
        this.UPLOAD_TABS_DIRECTORY,
        artist,
        fileName
      ].join('/');
    }
  };

  public getS3Key = {
    forTab: (fileName: string, artist: string): string => {
      return [this.UPLOAD_TABS_DIRECTORY, artist, fileName].join('/');
    }
  };

  private UPLOAD_TABS_DIRECTORY = 'tabs';
  private OBJECT_NOT_FOUND_ERROR_NAME = 'NotFound';
}

function ensureAllEnvironmentVariablesAreLoaded() {
  if (
    [
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_ACCESS_KEY_SECRET,
      AWS_S3_BUCKET_NAME,
      CLOUDFRONT_S3_BASE_URL
    ].some(isEmpty)
  ) {
    throw new Error('Unable to initialize S3 Client. Missing Env variables');
  }
}

export interface WriteToS3Args {
  artist: string;
  fileName: string;
  data: PutObjectCommandInput['Body'];
  key: string;
}
