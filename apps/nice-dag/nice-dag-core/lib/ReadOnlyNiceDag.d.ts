import { Point, Node, NiceDagInitArgs, IViewNode, NiceDagConfig, DagViewConfig, IEdge, IReadOnlyNiceDag, StyleObjectType, Size, NiceDagChangeListener, NiceDag, IViewModelChangeEvent, ViewModelChangeListener, NiceDagDirection, NodesMapper } from './types';
import ViewModel from './ViewModel';
import Minimap, { MinimapListener, IMinimapDraggingEvent } from './Minimap';
export declare type ViewChangeCallback = () => void;
declare class DagView implements ViewModelChangeListener {
    /**
     * The nodes layer is used to present nice-dag-node elements
     */
    private nodesLayer;
    private contentLayer;
    /**
     * The nodes layer is used to present egdges
     */
    private svgLayer;
    /**
     * View config object
     */
    private viewConfig;
    /**
     * List of sub views
     */
    private subViews;
    /**
     * View model given by constructor
     */
    model: ViewModel;
    constructor({ viewConfig, model }: {
        viewConfig: DagViewConfig;
        model: ViewModel;
    });
    private appendNode;
    getContentElement: () => HTMLElement;
    getEdgeLabel: (sourceId: string, targetId: string) => HTMLElement;
    private renderEdge;
    getNodeLayerSizeStyle: () => StyleObjectType;
    justifySize(size: Size): void;
    getContentLayerStyle: () => StyleObjectType;
    render: (parentElement: HTMLElement) => void;
    appendViewElement: (node: Node, contentLayer: HTMLElement) => void;
    resize: () => void;
    destory: () => void;
    clear(): void;
    onModelChange(event: IViewModelChangeEvent): void;
    getAllNodes(omitJointNode?: boolean): IViewNode[];
    getAllEdges(): IEdge[];
}
export default class ReadOnlyNiceDag implements IReadOnlyNiceDag, ViewModelChangeListener, MinimapListener {
    protected _rootContainer: HTMLElement;
    protected zoomLayer: HTMLElement;
    protected _config: NiceDagConfig;
    protected mainLayer: HTMLElement;
    protected rootView: DagView;
    protected minimap: Minimap;
    protected rootModel: ViewModel;
    protected uid: string;
    private listeners;
    protected parentSize: Size;
    protected _scale: number;
    private useDefaultMapEdgeToPoints;
    private destoried;
    constructor(args: NiceDagInitArgs);
    getRootContentElement: () => HTMLElement;
    setDirection(direction: NiceDagDirection): void;
    prettify(): void;
    onMinimapDragging(event: IMinimapDraggingEvent): void;
    onModelChange(event: IViewModelChangeEvent): void;
    adaptOverflow(): void;
    /**
     * Just make the writable nice dag to overwrite
     */
    justifyCenterWhenResizing(): void;
    get config(): NiceDagConfig;
    get rootContainer(): HTMLElement;
    get id(): string;
    center(size: Size): NiceDag;
    justifyCenter(size: Size): void;
    withNodes(nodes: Node[]): NiceDag;
    findNodeById: (id: string) => IViewNode;
    getElementByNodeId: (id: string) => HTMLElement;
    getEdgeLabel: (sourceId: string, targetId: string) => HTMLElement;
    getAllNodes(omitJointNode?: boolean): IViewNode[];
    getAllNodesMapper(omitJointNode?: boolean): NodesMapper;
    getAllEdges(): IEdge[];
    scrollTo: (id: string) => void;
    getScrollPosition: () => Point;
    render(): void;
    get isDestoried(): boolean;
    destory(): void;
    setScale(scale: number): void;
    adaptSizeWhenSetScale(scale: number): void;
    get scale(): number;
    fireNiceDagChange: () => void;
    fireMinimapChange: () => void;
    addNiceDagChangeListener: (listener: NiceDagChangeListener) => boolean;
    removeNiceDagChangeListener: (listener: NiceDagChangeListener) => boolean;
    private onMainLayerScroll;
}
export {};
