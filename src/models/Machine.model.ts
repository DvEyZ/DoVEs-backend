export interface Machine
{
    readonly name :string;
    readonly type :string;
    readonly address :string;
    readonly portRedirections :Array<{inbound :string, outbound :string}>;
    readonly status :string;
    readonly supplement: object;

    start() :Promise<any>;
    stop() :Promise<any>;
    restart() :Promise<any>;
    tearDown() :Promise<any>
}