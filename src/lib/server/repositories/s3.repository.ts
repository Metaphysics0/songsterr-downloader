import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { isEmpty } from 'lodash-es';
import { logger } from '$lib/utils/logger';
import { env } from '$env/dynamic/private';

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

  async write({ fileName, artist, data }: WriteToS3Args): Promise<string> {
    const uploadCommand = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: this.getKeyFromFileNameAndArtist(fileName, artist),
      Body: data,
      ACL: 'public-read'
    });
    try {
      await this.client.send(uploadCommand);
      return this.getPublicS3UrlFromFileNameAndArtist(fileName, artist);
    } catch (error) {
      logger.error('error uploading to s3', error);
      return '';
    }
  }

  async head(fileName: string, artist: string): Promise<string> {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: this.getKeyFromFileNameAndArtist(fileName, artist)
    });
    try {
      const response = await this.client.send(headObjectCommand);
      if (response) {
        return this.getPublicS3UrlFromFileNameAndArtist(fileName, artist);
      }

      return '';
    } catch (error: any) {
      if (error.name === this.OBJECT_NOT_FOUND_ERROR_NAME) {
        logger.error(
          'S3 HeadObjectCommand miss',
          `for ${artist} - ${fileName}`
        );
      }

      return '';
    }
  }

  async writeIfNotExists({
    fileName,
    artist,
    data
  }: {
    artist: string;
    fileName: string;
    data: PutObjectCommandInput['Body'];
  }): Promise<string> {
    const existingLink = await this.head(fileName, artist);
    if (existingLink) {
      logger.log(`already stored in S3`);
      return existingLink;
    }
    return this.write({ fileName, artist, data });
  }

  getPublicS3UrlFromFileNameAndArtist = (fileName: string, artist: string) =>
    [this.S3_BASE_URL, artist, fileName].join('/');

  getKeyFromFileNameAndArtist = (fileName: string, artist: string) =>
    [this.UPLOAD_TABS_DIRECTORY, artist, fileName].join('/');

  private UPLOAD_TABS_DIRECTORY = 'tabs';
  private S3_BASE_URL = `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${this.UPLOAD_TABS_DIRECTORY}`;
  private OBJECT_NOT_FOUND_ERROR_NAME = 'NotFound';
}
function ensureAllEnvironmentVariablesAreLoaded() {
  if (
    [
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_ACCESS_KEY_SECRET,
      AWS_S3_BUCKET_NAME
    ].some(isEmpty)
  ) {
    throw new Error('Unable to initialize S3 Client. Missing Env variables');
  }
}

export interface WriteToS3Args {
  artist: string;
  fileName: string;
  data: PutObjectCommandInput['Body'];
}
