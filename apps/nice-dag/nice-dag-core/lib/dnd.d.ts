import { HtmlElementBounds, MapEdgeToPoints, StyleObjectType, IViewNode, EdgePoints } from './types';
import DndContext from './dndContext';
import { XDirection, YDirection } from './dndTypes';
export default class NiceDagDnd {
    private _rootContainer;
    private _glassStyles;
    private draggingNode;
    private draggingNodeMirror;
    private draggingElement;
    private _enabled;
    private editableGlass;
    private editorForeContainer;
    private context;
    private isDraggingEdge;
    private mapEdgeToPoints;
    private draggingNodeParentBounds;
    private svgBackgroundBounds;
    private eligibleEdgeConnectors;
    private originalScrollPosition;
    private mapNodeToDraggingElementClass;
    private asSourceDraggingEdges;
    private asTargetDraggingEdges;
    private documentUserSelect;
    constructor(rootContainer: HTMLElement, glassStyles: StyleObjectType, mapEdgeToPoints: MapEdgeToPoints, editorForeContainer: HTMLElement, mapNodeToDraggingElementClass: StyleObjectType);
    buildGlass: () => void;
    setEnabled: (enabled: boolean) => void;
    private initContext;
    withContext: (dndContext: DndContext) => NiceDagDnd;
    buildDraggingElement: (node: IViewNode) => HTMLElement;
    computeDependenciesOfDraggingNode: (node: IViewNode) => void;
    disableUserSelect: () => void;
    restoreUserSelect: () => void;
    startNodeDragging: (node: IViewNode, e: MouseEvent) => void;
    moveDraggingElement: () => void;
    renderEdge: (edgeSvg: SVGElement, edgePoints: EdgePoints) => void;
    mapEdgePointToGlobal: (edgePoints: EdgePoints) => {
        source: {
            x: number;
            y: number;
        };
        target: {
            x: number;
            y: number;
        };
    };
    renderEdgesWhenDraggingElement: (lastBounds: HtmlElementBounds) => void;
    startEdgeDragging: (node: IViewNode, e: MouseEvent) => void;
    destory(): void;
    private onDraggingEdge;
    private findPotentialEdgeTarget;
    onDragging: (event: MouseEvent) => void;
    onDraggingNode(xDirection: XDirection, yDirection: YDirection): void;
    endDragging: (event: MouseEvent) => void;
    private updateRelativeMousePoint;
    private scrollIfNeeded;
}
