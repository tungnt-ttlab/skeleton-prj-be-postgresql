/* eslint-disable @typescript-eslint/no-unused-vars */
type ErrorResponse = import('./common/helpers/response').ErrorResponse;
type JoiRoot = typeof import('joi');
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
    ...args: any
) => Promise<infer R>
    ? R
    : any;

type ClassType<T = any> = new (...args: any[]) => T;

type SchemaAttribute<T> = keyof T;

type ValidatorResult<E = ErrorResponse, R = any> =
    | {
          success: false;
          error: E;
      }
    | {
          success: true;
          data: R;
      };

type ExtractValidationResult<T> = T extends { success: true; data: infer R }
    ? R
    : never;

type ValidatorFunction<E = ErrorResponse, R> = (opts?: {
    previousData: any;
    data: any;
}) => Promise<ValidatorResult<E, R>> | ValidatorResult<E, R>;

type ReturnTypes<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => infer R ? R : never;
};
type AsyncFunction<T> = () => Promise<T>;
type TFunction<T> = (...args: any[]) => T;

type AsyncReturnTypes<T> = {
    readonly [K in keyof T]: T[K] extends AsyncFunction<infer R>
        ? R
        : T[K] extends TFunction<infer X>
          ? X
          : never;
};

type AsyncReturnValidationResultTypes<T> = {
    readonly [K in keyof T]: T[K] extends AsyncFunction<infer R1>
        ? ExtractValidationResult<R1>
        : T[K] extends TFunction<infer R2>
          ? ExtractValidationResult<R2>
          : never;
};

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type SchemaCreateEntity<T> = Omit<
    T,
    'createdAt' | 'updatedAt' | 'id' | 'location'
> & {
    id?: string;
    createdAt?: Date;
};

type SchemaUpdateEntity<T> = QueryDeepPartialEntity<T>;

type LoggerWinston = import('winston').Logger;
