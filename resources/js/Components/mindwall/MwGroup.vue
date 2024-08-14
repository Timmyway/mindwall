<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';

const props = defineProps({
    config: Object
});

const canvasEventsStore = useCanvasEventsStore();

const { isMwGroupConfig } = useCanvasConditions();
</script>

<template>
    <template v-if="isMwGroupConfig(config)">
        <v-group
            :config="config"
            @transformend="canvasEventsStore.handleTransformEnd"
            @contextmenu="canvasEventsStore.handleGroupContextMenu"
            @dragstart="canvasEventsStore.onGroupDragstart"
            @dragend="canvasEventsStore.onDragend"
        >
            <template v-for="nestedConfig, nestedConfigName in config?.items" :key="nestedConfigName">
                <mw-group-config v-if="isMwGroupConfig(config)" :config="nestedConfig"></mw-group-config>
                <mw-shape-config v-else :config="nestedConfig"></mw-shape-config>
            </template>
        </v-group>
    </template>
</template>
