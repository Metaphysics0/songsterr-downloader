import { QSTASH_TOKEN } from '$env/static/private';
import { Client } from '@upstash/qstash/.';

export default new Client({
  token: QSTASH_TOKEN
});
