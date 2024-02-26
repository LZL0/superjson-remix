import {
  MetaDescriptor,
  useLoaderData as useRemixLoaderData,
} from '@remix-run/react';
// import { ServerRuntimeMetaDescriptor } from '@remix-run/server-runtime';

import { json as remixJson, MetaFunction } from '@remix-run/node';
import { serialize, deserialize } from 'superjson';
import { SuperJSONResult } from 'superjson/dist/types';

type JsonResponse = ReturnType<typeof remixJson>;
type MetaArgs = Parameters<MetaFunction>[0];
type MetaArgsSansData = Omit<MetaArgs, 'data'>;

type SuperJSONMetaFunction<Data> = {
  (args: MetaArgsSansData & { data: Data }): MetaDescriptor;
};

export const json = <Data,>(
  obj: Data,
  init?: number | ResponseInit
): JsonResponse => {
  const superJsonResult = serialize(obj);
  return remixJson(superJsonResult, init);
};

export const parse = <Data,>(superJsonResult: SuperJSONResult) =>
  deserialize(superJsonResult) as Data;

export const withSuperJSON = <Data,>(
  metaFn: MetaFunction
): SuperJSONMetaFunction<Data> => ({
  data,
  ...rest
}: MetaArgs): MetaDescriptor =>
  metaFn({ ...rest, data: parse<Data>(data as any) }) as any;

export const useLoaderData = <Data,>() => {
  const loaderData = useRemixLoaderData<any>(); // HACK: any to avoid type error
  return parse<Data>(loaderData);
};

export const useSuperJSONLoaderData = useLoaderData;
