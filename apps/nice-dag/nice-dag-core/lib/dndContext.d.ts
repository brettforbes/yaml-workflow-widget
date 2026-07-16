import { IDndProvider } from './dndTypes';
import { HtmlElementBounds, Point } from './types';
import { XDirection, YDirection } from './dndTypes';
interface DndContextInternalInitArgs {
    rootXy: Point;
    zoomLayerXy: Point;
    bounds: HtmlElementBounds;
    provider?: IDndProvider;
    mPoint?: Point;
    scale?: number;
}
export default class DndContext {
    private mouseDownTimestamp;
    private originalBounds;
    private _originalPoint;
    private mrPoint;
    private originalOffset;
    private zoomLayerXy;
    invalidDropping: boolean;
    readonly _provider: IDndProvider;
    readonly dir: String;
    readonly _scale: number;
    readonly validDndThreshold: number;
    constructor({ rootXy, zoomLayerXy, mPoint, bounds, scale, provider }: DndContextInternalInitArgs);
    get originalPoint(): Point;
    lastBounds(relative?: boolean, useOriginal?: boolean): HtmlElementBounds;
    /**
     * Relative point to Root
     */
    moveTo: (mPoint: Point, rootXy: HtmlElementBounds) => void;
    get xyDelta(): {
        x: number;
        y: number;
    };
    topLeftDelta(point: Point): {
        x: number;
        y: number;
    };
    get provider(): IDndProvider;
    /**
     * Return relative mouse point
     */
    get point(): Point;
    /**
     * Get x Direction
     * 1. Convert global point to relative point
     * 2. Compare the relative point with current
     *
     * @param {mPoint, rootXy} mPoint:Mouse point (Global), rootXy:Current root bounds (Global)
     * @returns lr|none|rl
     */
    xDirection: (mPoint: Point, rootXy: HtmlElementBounds) => XDirection;
    yDirection: (mPoint: Point, rootXy: HtmlElementBounds) => YDirection;
    allowDrop: () => boolean;
}
export {};
