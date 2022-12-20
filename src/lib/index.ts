import { Installer, ExplorerState } from '@youwol/os-core'
import { ExplorerBackend, AssetsGateway } from '@youwol/http-clients'
import { uploadFile$ } from './upload-data'
import { Observable } from 'rxjs'
import { RequestEvent } from '@youwol/http-primitives'

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromManifests: [
            {
                id: '@youwol/installers-potree.basic',
                contextMenuActions: ({
                    node,
                    explorer,
                }: {
                    node:
                        | ExplorerBackend.GetItemResponse
                        | ExplorerBackend.GetFolderResponse
                    explorer: ExplorerState
                    assetsGtwClient: AssetsGateway.AssetsGatewayClient
                }) => [
                    {
                        name: 'Upload potree project',
                        icon: { class: 'fas fa-upload' },
                        enabled: () => true,
                        exe: async () => {
                            const input = document.createElement('input')
                            input.setAttribute('type', 'file')
                            input.setAttribute('multiple', 'false')
                            input.dispatchEvent(new MouseEvent('click'))
                            input.onchange = () => {
                                Array.from(input.files).forEach((file) => {
                                    const resp: {
                                        progress$: Observable<RequestEvent>
                                        response$: Observable<
                                            AssetsGateway.NewAssetResponse<unknown>
                                        >
                                    } = uploadFile$(node, file)
                                    explorer.newAsset({
                                        parentNode: node,
                                        pendingName: file.name,
                                        response$: resp.response$,
                                        progress$: resp.progress$,
                                    })
                                })
                                input.remove()
                            }
                        },
                        applicable: () =>
                            ExplorerBackend.isInstanceOfFolderResponse(node),
                    },
                ],
            },
        ],
    })
}
