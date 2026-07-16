import NiceDagTypes from '@ebay/nice-dag-core/lib/types';
export interface NiceDagReactiveType {
    id: string;
    observor: number;
    use: () => NiceDagTypes.NiceDag | undefined;
}
declare function create(id: string): {
    id: string;
    observor: number;
    use: () => NiceDagTypes.NiceDag | undefined;
};
declare function get(id: string): NiceDagReactiveType;
declare function remove(id: string): void;
declare function inc(id: string): void;
declare const _default: {
    create: typeof create;
    get: typeof get;
    inc: typeof inc;
    remove: typeof remove;
};
export default _default;
