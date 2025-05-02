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

  getParamsFromUrl<T>({
    url,
    params
  }: {
    url: URL;
    params: PermittedSpecification[];
  }): T {
    const permittedParams = params.map((param) => {
      const value = url.searchParams.get(param.key);
      if (param.required && !value)
        throw new Error(`missing param: ${param.key}`);

      return [param.key, value];
    });

    return Object.fromEntries(permittedParams) as T;
  }
}

interface PermittedSpecification {
  key: string;
  required?: boolean;
  type?: string;
}
