import { ViewModelConfig, Node, Size, Point, IEdge, IViewNode, ViewNodeChangeListener, ViewModelChangeListener, IViewModelChangeEvent, IViewModel, ViewNodeChangeEvent, Padding } from './types';
export default class ViewModel implements IViewModel, ViewNodeChangeListener, ViewModelChangeListener {
    private vNodes;
    private pChildVMs;
    private _parentNode;
    private vmConfig;
    private pEdges;
    private pSize;
    private listeners;
    private isRootModel;
    private _dagId;
    constructor({ dagId, parentNode, nodes, vmConfig, isRootModel }: {
        dagId: string;
        parentNode: Node;
        nodes: Node[];
        vmConfig: ViewModelConfig;
        isRootModel?: boolean;
    });
    setRootOffset({ offsetX, offsetY }: {
        offsetX: number;
        offsetY: number;
    }): void;
    addNodes(nodes: Node[], point: Point, offset?: number): IViewNode[];
    addNode(node: Node, point: Point, joint?: boolean): IViewNode;
    destory(): void;
    removeEdge(edge: IEdge): boolean;
    findEdgesBySourceId(id: string): IEdge[];
    findEdgesByTargetId(id: string): IEdge[];
    refreshJointNodes(): void;
    createEdgeAndFireModelChange(source: IViewNode, target: IViewNode): IEdge;
    addEdge(source: IViewNode, target: IViewNode): IEdge;
    /**
     * Watch sub child view model change
     * @param event
     */
    onModelChange(event: IViewModelChangeEvent): void;
    /**
     * Watch nodes change
     * @param event
     */
    onNodeChange: (event: ViewNodeChangeEvent) => void;
    private createChildVm;
    get isRoot(): boolean;
    addModelChangeListener: (listener: ViewModelChangeListener) => void;
    removeNodeChangeListener: (listener: ViewModelChangeListener) => void;
    getAllNodes(): IViewNode[];
    getAllEdges(): IEdge[];
    isSubViewNode: (id: string) => boolean;
    findNodeById: (id: string) => IViewNode;
    findNodesByPrecedentNodeId(id: string): IViewNode[];
    findNodesByDependencies: (dependencies: string[]) => IViewNode[];
    private init;
    private setNodeCollapse;
    get dagId(): string;
    private fireModelChange;
    private withJointNodes;
    buildVNodes: (_nodes: Node[]) => void;
    toViewNode(node: Node): IViewNode;
    private withNodeSize;
    get subViewPadding(): Padding;
    setViewSize(size: Size, withPadding?: boolean): void;
    resize: (fireModelChange: boolean) => boolean;
    doLayout: (fireModelChange: boolean, cascade: boolean) => boolean;
    buildEdges: () => void;
    get parentNode(): Node;
    get id(): string;
    size: (withPadding?: boolean) => Size;
    get(): Size;
    get childVMs(): ViewModel[];
    get nodes(): IViewNode[];
    get edges(): IEdge[];
}
