import { NiceDagInitArgs, NiceDag } from "./types";
import * as niceDagHolder from './niceDagHolder';
declare function init(initArgs: NiceDagInitArgs, editable?: boolean): NiceDag;
declare const _default: {
    use: typeof niceDagHolder.use;
    init: typeof init;
};
export default _default;
