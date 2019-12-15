import { createWaitablePromise, encode, WaitablePromise } from '@algolia/client-common';
import { MethodEnum } from '@algolia/requester-common';
import { mapRequestOptions, RequestOptions } from '@algolia/transporter';

import { SaveSynonymsOptions, SaveSynonymsResponse, SearchIndex, Synonym } from '../..';
import { waitTask } from '.';

export const saveSynonyms = (base: SearchIndex) => {
  return (
    synonyms: readonly Synonym[],
    requestOptions?: SaveSynonymsOptions & RequestOptions
  ): Readonly<WaitablePromise<SaveSynonymsResponse>> => {
    const { forwardToReplicas, replaceExistingSynonyms, ...options } = requestOptions || {};
    const mappedRequestOptions = mapRequestOptions(options);

    if (forwardToReplicas) {
      mappedRequestOptions.queryParameters.forwardToReplicas = 1; // eslint-disable-line functional/immutable-data
    }

    if (replaceExistingSynonyms) {
      mappedRequestOptions.queryParameters.replaceExistingSynonyms = 1; // eslint-disable-line functional/immutable-data
    }

    return createWaitablePromise<SaveSynonymsResponse>(
      base.transporter.write<SaveSynonymsResponse>(
        {
          method: MethodEnum.Post,
          path: encode('1/indexes/%s/synonyms/batch', base.indexName),
          data: synonyms,
        },
        mappedRequestOptions
      ),
      (response, waitRequestOptions) => waitTask(base)(response.taskID, waitRequestOptions)
    );
  };
};
