import dagre from 'dagre';
export declare enum ViewModelChangeEventType {
    REMOVE_SUB_VIEW = "REMOVE_SUB_VIEW",
    ADD_SUB_VIEW = "ADD_SUB_VIEW",
    RESIZE = "RESIZE",
    ADD_NODE = "ADD_NODE",
    REMOVE_NODE = "REMOVE_NODE",
    ADD_EDGE = "ADD_EDGE",
    REMOVE_EDGE = "REMOVE_EDGE"
}
export declare enum ViewNodeChangeEventType {
    SHRINK_NODE = "SHRINK_NODE",
    EXPAND_NODE = "EXPAND_NODE",
    POSITION_CHANGE = "POSITION_CHANGE",
    RESIZE = "RESIZE",
    REMOVED = "REMOVED",
    ADD_CHILD_NODE = "ADD_CHILD_NODE"
}
export declare enum NiceDagDirection {
    LR = "LR",
    RL = "RL",
    TB = "TB",
    BT = "BT"
}
export declare enum EdgeConnectorType {
    CENTER_OF_BORDER = "CENTER_OF_BORDER",
    CENTER = "CENTER"
}
export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export declare type Bounds = Point & Size;
export declare type HtmlElementBounds = Bounds & {
    left?: number;
    top?: number;
    bottom?: number;
    right?: number;
};
export declare type NodeData = Record<string, any>;
export interface Node {
    /**
     * List of ID list which represents the node depends on
     */
    dependencies?: string[];
    id: string;
    data?: NodeData;
    children?: Node[];
    parentId?: string;
    /**
     * if yes, doesn't show children diagram
     */
    collapse?: boolean;
    edgeConnectorType?: EdgeConnectorType;
}
export interface ViewNodeChangeEvent {
    type: ViewNodeChangeEventType;
    node: IViewNode;
    data?: any;
}
export interface ViewNodeChangeListener {
    onNodeChange: (event: ViewNodeChangeEvent) => void;
}
export interface IViewModelChangeEvent {
    type: ViewModelChangeEventType;
    source: IViewModel;
    originalSource?: IEdge | IViewNode;
}
export interface ViewModelChangeListener {
    onModelChange: (event: IViewModelChangeEvent) => void;
}
export interface IEdge {
    source: IViewNode;
    target: IViewNode;
    pathRef?: SVGElement;
    ref?: HTMLElement;
    remove?: () => void;
    model?: IViewModel;
    destory?: () => void;
    doLayout?: () => void;
    insertNodes?: (nodes: Node[], offset?: number) => void;
}
export interface EdgeAttributes {
    color?: string;
    hideArrow?: boolean;
}
export interface Padding {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}
export interface EdgePoints {
    source: Point;
    target: Point;
}
export declare type MapNodeToElement = (node: Node) => HTMLElement;
export declare type MapNodeToDraggingElementClass = (node: Node) => StyleObjectType;
export declare type MapEdgeToElement = (edge: IEdge) => HTMLElement;
export declare type OnEdgeDropped = (sourceNode: IViewNode, targetNode: IViewNode) => void;
export declare type MapEdgeToPoints = (edge: IEdge) => EdgePoints;
export declare type GetViewElement = (node?: Node) => HTMLElement;
export declare type GetNodeSize = (node: Node) => Size;
export declare type GetEdgeAttributes = (edge: IEdge) => EdgeAttributes;
export declare type GetGateElement = (node: Node) => HTMLElement;
export declare type StyleObjectType = any;
export declare type ElementAttributesType = any;
export interface GridConfig {
    size?: number;
    color?: string;
    visible?: boolean;
}
export interface MinimapConfig {
    className?: string;
    viewBoxClassName?: string;
}
export interface NiceDagConfig {
    id?: string;
    mapNodeToElement?: MapNodeToElement;
    mapEdgeToElement?: MapEdgeToElement;
    onEdgeDropped?: OnEdgeDropped;
    mapEdgeToPoints?: MapEdgeToPoints;
    getViewElement?: GetViewElement;
    getNodeSize: GetNodeSize;
    getEdgeAttributes?: GetEdgeAttributes;
    getGateElement?: GetGateElement;
    subViewPadding?: Padding;
    rootViewPadding?: Padding;
    mode?: NiceDagMode;
    graphLabel?: dagre.GraphLabel;
    glassStyles?: StyleObjectType;
    gridConfig?: GridConfig;
    modelType?: NiceDagModelType;
    edgeConnectorType?: EdgeConnectorType;
    jointEdgeConnectorType?: EdgeConnectorType;
    minimapConfig?: MinimapConfig;
    omitJointBeforeEnd?: boolean;
    mapNodeToDraggingElementClass?: MapNodeToDraggingElementClass;
}
export declare type ViewModelConfig = Pick<NiceDagConfig, 'rootViewPadding' | 'subViewPadding' | 'mode' | 'modelType' | 'edgeConnectorType' | 'jointEdgeConnectorType' | 'omitJointBeforeEnd'>;
export declare type DagViewConfig = ViewModelConfig & Pick<NiceDagConfig, 'mapEdgeToPoints' | 'mapNodeToElement' | 'mapEdgeToElement' | 'getViewElement' | 'subViewPadding' | 'getGateElement' | 'getEdgeAttributes' | 'onEdgeDropped'>;
export interface NiceDagInitArgs extends NiceDagConfig {
    container: HTMLElement;
    minimapContainer?: HTMLElement;
}
export declare enum NiceDagModelType {
    HIERARCHY = "HIERARCHY",
    FLATTEN = "FLATTEN"
}
export declare enum NiceDagMode {
    DEFAULT = "DEFAULT",
    WITH_JOINT_NODES = "WITH_JOINT_NODES"
}
export interface IViewModel {
    id: string;
    findNodeById(id: string): IViewNode;
    findNodesByDependencies(dependencies: string[]): IViewNode[];
    findNodesByPrecedentNodeId(id: string): IViewNode[];
    removeEdge(edge: IEdge): void;
    findEdgesBySourceId(id: string): IEdge[];
    findEdgesByTargetId(id: string): IEdge[];
    addEdge(source: IViewNode, target: IViewNode): IEdge;
    addNode(node: Node, point: Point): IViewNode;
    addNodes(nodes: Node[], point: Point, offset?: number): IViewNode[];
    subViewPadding: Padding;
    dagId: string;
}
export interface IViewNode extends Node, Bounds {
    shrink?: () => void;
    expand?: () => void;
    withChildren: (promise: Promise<Node[]>, useCache?: boolean) => void;
    refresh?: () => void;
    remove?: () => void;
    connect?: (node: IViewNode) => IEdge;
    addNodeChangeListener: (listener: ViewNodeChangeListener) => void;
    removeNodeChangeListener: (listener: ViewNodeChangeListener) => void;
    removeDependency: (source: IViewNode) => void;
    doLayout: () => void;
    resize: (size: Size) => void;
    addChildNode: (node: Node, point: Point, joint?: boolean) => Node;
    destory: () => void;
    fireNodeChange: (e: ViewNodeChangeEvent) => void;
    findEdgesAsSource(): IEdge[];
    findEdgesAsTarget(): IEdge[];
    setPoint: (point: Point) => void;
    joint?: boolean;
    editing?: boolean;
    ref: HTMLElement;
    model: IViewModel;
    cloneWithProps: () => IViewNode;
}
export interface NodesMapper {
    [Key: string]: IViewNode;
}
export interface NiceDag {
    id: string;
    render: () => void;
    destory: () => void;
    setScale: (scale: number) => void;
    center: (size: Size) => NiceDag;
    scrollTo: (id: string) => void;
    setDirection: (direction: NiceDagDirection) => void;
    getScrollPosition: () => Point;
    getAllNodes: (omitJointNode?: boolean) => IViewNode[];
    getAllNodesMapper: (omitJointNode?: boolean) => NodesMapper;
    getAllEdges: () => IEdge[];
    getElementByNodeId: (id: string) => HTMLElement;
    getRootContentElement: () => HTMLElement;
    getEdgeLabel: (sourceId: string, targetId: string) => HTMLElement;
    withNodes: (nodes: Node[]) => NiceDag;
    findNodeById: (id: String) => IViewNode;
    /**
     * Return false means the listener exists
     */
    addNiceDagChangeListener: (listener: NiceDagChangeListener) => boolean;
    /**
     * Return false means the listener doesn't exist
     */
    removeNiceDagChangeListener: (listener: NiceDagChangeListener) => boolean;
    fireNiceDagChange: () => void;
    fireMinimapChange: () => void;
    config: NiceDagConfig;
    isDestoried: boolean;
}
export declare type IReadOnlyNiceDag = NiceDag;
export declare type IWritableNiceDag = IReadOnlyNiceDag & {
    startEditing: () => IWritableNiceDag;
    stopEditing: () => IWritableNiceDag;
    prettify: () => IWritableNiceDag;
    editing: boolean;
    startEdgeDragging: (node: IViewNode, e: MouseEvent) => void;
    startNodeDragging: (node: IViewNode, e: MouseEvent) => void;
    addNode: (node: Node, point: Point, targetNodeId?: string) => void;
    addJointNode(node: Node, point: Point, targetNodeId?: string): void;
    gridVisible: boolean;
};
export interface NiceDagChangeListener {
    onChange: () => void;
}
