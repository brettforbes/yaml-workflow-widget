import { ViewNodeChangeListener, ViewNodeChangeEvent, IEdge, IViewNode, Node } from './types';
export default class Edge implements IEdge, ViewNodeChangeListener {
    source: IViewNode;
    target: IViewNode;
    pathRef?: SVGElement;
    ref?: HTMLElement;
    constructor(source: IViewNode, target: IViewNode);
    destory(): void;
    onNodeChange(event: ViewNodeChangeEvent): void;
    insertNodes(nodes: Node[], offset?: number): void;
    private getInsertNodesStartPosition;
    remove(): void;
    doLayout(): void;
}
