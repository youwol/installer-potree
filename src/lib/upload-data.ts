import { ReplaySubject } from 'rxjs'
import { mergeMap, map, shareReplay } from 'rxjs/operators'
import { AssetsGateway } from '@youwol/http-clients'
import { RequestEvent, raiseHTTPErrors } from '@youwol/http-primitives'

export function uploadFile$(folder, file: File) {
    const progress$ = new ReplaySubject<RequestEvent>(1)
    const client = new AssetsGateway.Client().assets
    const response$ = client
        .createAsset$({
            body: {
                kind: '@potree/cloud-points',
                name: file.name,
                zippedFiles: file,
                description: 'Cloud point project',
                tags: ['potree', 'cloud points', 'test'],
            },
            queryParameters: {
                folderId: folder.id,
            },
        })
        .pipe(
            raiseHTTPErrors(),
            mergeMap((assetResponse) => {
                // console.log('Assets resp 1: ', assetResponse)
                return client
                    .addZipFiles$({
                        assetId: assetResponse.assetId,
                        body: {
                            content: file,
                        },
                        callerOptions: {
                            monitoring: {
                                channels$: [progress$],
                                requestId: file.name,
                            },
                        },
                    })
                    .pipe(
                        raiseHTTPErrors(),
                        map(() => {
                            return assetResponse
                        }),
                    )
            }),
            shareReplay({
                bufferSize: 1,
                refCount: true,
            }),
        )
    return { response$, progress$ }
}
