import { IEdge, EdgeAttributes, EdgePoints, Padding } from "./types";
export declare const DEFAULT_GRID_CONFIG: {
    color: string;
    size: number;
    visible: boolean;
};
export declare const DEFAULT_SUBVIEW_PADDING: {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export declare const ZERO_PADDING: {
    top: number;
    bottom: number;
    left: number;
    right: number;
};
export declare const ZERO_PADDING_STYLE: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
};
export declare const mapEdgeToPointsWithDir: {
    LR: ({ source, target }: IEdge) => EdgePoints;
    RL: ({ source, target }: IEdge) => EdgePoints;
    BT: ({ source, target }: IEdge) => EdgePoints;
    TB: ({ source, target }: IEdge) => EdgePoints;
};
export declare function graphLabelWithDefaultValues(graphLabel?: dagre.GraphLabel): dagre.GraphLabel;
export declare function paddingWithDefaultValues(padding?: Padding, defaultValues?: Padding): Padding;
export declare function getDefaultEdgesAttributes(): EdgeAttributes;
