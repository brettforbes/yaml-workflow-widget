import NiceDagEdges from './components/NiceDagEdges.vue';
import NiceDagNodes from './components/NiceDagNodes.vue';
import NiceDagRootView from './components/NiceDagRootView.vue';
import NiceDagTypes from '@ebay/nice-dag-core/lib/types';
import type { NiceDagReactiveType } from './niceDagReactive';
import type { Ref } from 'vue';
import type { MinimapConfig } from '@ebay/nice-dag-core/lib/types';
export declare type UseNiceDagArgs = Omit<NiceDagTypes.NiceDagInitArgs, 'container'> & {
    scrollPosition?: NiceDagTypes.Point;
    initNodes: NiceDagTypes.Node[];
    onMount?: () => void;
    editable?: boolean;
    minimapConfig?: MinimapConfig;
};
export declare type UseNiceDagType = {
    niceDagEl: Ref<HTMLElement | undefined>;
    minimapEl: Ref<HTMLElement | undefined>;
    niceDagReactive: NiceDagReactiveType;
    reset: () => void;
};
declare function useNiceDag(args: UseNiceDagArgs): UseNiceDagType;
export { useNiceDag, NiceDagEdges, NiceDagNodes, NiceDagRootView, };
