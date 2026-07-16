import ReadOnlyNiceDag from "./ReadOnlyNiceDag";
import { Grid, IDndProvider } from './dndTypes';
import { NiceDagInitArgs, NiceDag, HtmlElementBounds, Point, Size, IWritableNiceDag, Node, IViewModelChangeEvent, ViewModelChangeListener, IViewNode } from './types';
export default class WritableNiceDag extends ReadOnlyNiceDag implements IDndProvider, ViewModelChangeListener, IWritableNiceDag {
    private _dnd;
    private _editing;
    private svgGridBkg;
    private svgDndBkg;
    private editorBkgContainer;
    private editorForeContainer;
    private _grid;
    private glassStyles;
    private _gridVisible;
    private mapNodeToDraggingElementClass;
    constructor(args: NiceDagInitArgs);
    onEdgeDropped(sourceNode: IViewNode, targetNode: IViewNode): void;
    endNodeDragging(): void;
    endEdgeDragging(): void;
    get svgDndBackground(): SVGElement;
    onModelChange(event: IViewModelChangeEvent): void;
    get grid(): Grid;
    get validDndThreshold(): number;
    addJointNode(node: Node, point?: Point, targetNodeId?: string): Node;
    addNode(node: Node, point?: Point, targetNodeId?: string): Node;
    startEditing: () => IWritableNiceDag;
    stopEditing: () => IWritableNiceDag;
    withNodes(nodes: Node[]): NiceDag;
    get editing(): boolean;
    justifyCenterWhenResizing(): void;
    center(size: Size): NiceDag;
    doForegroundLayout(): void;
    set gridVisible(visible: boolean);
    get gridVisible(): boolean;
    showGrid(): void;
    hideGrid(): void;
    prettify(): IWritableNiceDag;
    adaptOverflow(): void;
    /**
     * Resize foreground
     * @param bounds this.context.lastBounds(true, true)
     * @returns void
     */
    resizeForeground(bounds: HtmlElementBounds): boolean;
    drawGrid(): void;
    render(): void;
    startEdgeDragging: (node: IViewNode, e: MouseEvent) => void;
    justifyCenter(size: Size): void;
    setScale(scale: number): void;
    justCenterWhenStartEditing(): void;
    adaptSizeWhenSetScale(scale: number): void;
    startNodeDragging: (node: IViewNode, e: MouseEvent) => void;
    getParentTopLeft(node: IViewNode): Point;
    destory(): void;
}
