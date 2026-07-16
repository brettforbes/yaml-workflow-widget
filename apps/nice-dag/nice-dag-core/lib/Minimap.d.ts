import { MinimapConfig } from './types';
export declare type MinimapInitArgs = MinimapConfig & {
    mainLayer: HTMLElement;
    zoomLayer: HTMLElement;
    container: HTMLElement;
};
export interface IMinimapDraggingEvent {
    scrollLeft: number;
    scrollTop: number;
}
export interface MinimapListener {
    onMinimapDragging: (event: IMinimapDraggingEvent) => void;
}
export default class Minimap {
    protected scale: number;
    protected viewBoxScale: number;
    protected viewBoxInitX: number;
    protected viewBoxInitY: number;
    protected mainLayer: HTMLElement;
    protected zoomLayer: HTMLElement;
    protected minimapContent: HTMLElement;
    protected viewBoxElm: HTMLElement;
    protected viewBoxClassname: String;
    protected canvas: HTMLCanvasElement;
    private dndGlass;
    protected initClientX: number;
    protected initClientY: number;
    private listeners;
    private parentContainer;
    private contentContainer;
    constructor(args: MinimapInitArgs);
    addMinimapListener(listener: MinimapListener): void;
    createMinimapElement(minimapClassname: string): HTMLElement;
    createViewBoxElement(viewBoxClassname: string): HTMLElement;
    calcRatio(): void;
    useWidth(): boolean;
    render(): void;
    destory(): void;
    clear(): void;
    private onCanvasReady;
    updateViewBoxPosition: () => void;
    setViewBoxScale(viewBoxScale: number): void;
    private startViewBoxDragging;
    private onViewBoxDragging;
    private onViewBoxDraggingEnd;
}
