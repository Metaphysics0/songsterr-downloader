import { pick } from 'lodash-es';
export class ParamsHelper {
  async getRequiredParams<T>({
    request,
    params
  }: {
    request: Request;
    params: string[];
  }): Promise<T> {
    const requestParams = await request.json();
    const permittedParams = pick(requestParams, params);
    const missingParams = params.filter((param) => !(param in permittedParams));

    if (missingParams.length > 0) {
      throw new Error(`Missing required params: ${missingParams.join(', ')}`);
    }

    return permittedParams as T;
  }
}
