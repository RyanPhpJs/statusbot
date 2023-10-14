import { AxiosResponse } from "axios"

export type APIMethod<Item> = (args: Item) => Promise<AxiosResponse>

export class APIClient {
    constructor(options: { endpoint: string, token: string}) : APIClient
    sendOnline(args: {
        avatar_url: string,
        name: string,
        cluster_id: number,
        country?: string,
        provider?: string,
    }): Promise<AxiosResponse>

    sendError(args: {
        data: string,
        cluster_id?: number,
        resumed?: string
    }): Promise<AxiosResponse>
}