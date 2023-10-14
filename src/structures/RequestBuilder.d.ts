import e from "express"
export type ParamParser<K> = {
    [key in keyof K]: K[key]['type'] extends 'string' ? (K[key]['required'] extends true ? string : string | null) :
                   K[key]['type'] extends 'number' ? (K[key]['required'] extends true ? number : number | null) :
                   K[key]['type'] extends 'boolean' ? (K[key]['required'] extends true ? boolean : boolean | null) :
                   never;
}
export type RouteCallback<U, K> = (req: e.Request<U , null, ParamParser<K>>, res: e.Response, next: e.NextFunction) => Promise<any>


export function RequestBuilder<K extends { [key: string]: { type: "string"|"number"|"boolean", required?: boolean}}>(options: {
    url: string,
    method?: "GET"|"POST",
    body?: K = {},
    auth?: boolean
}, callback: RouteCallback<Record<string, string>, K>);