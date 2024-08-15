<script setup lang="ts">
import { useCanvasConditions } from '@/composable/useCanvasConditions';
import { useCanvasEventsStore } from '@/store/canvasEventsStore';
import { type MwGroupConfig } from '@/types/konva.config';

const props = defineProps<{
    config: MwGroupConfig,
}>();

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
            <template v-for="nestedConfig, nestedConfigIndex in config.items" :key="nestedConfig.id">
                <mw-group-config v-if="isMwGroupConfig(config)" :config="nestedConfig"></mw-group-config>
                <mw-shape-config v-else :config="nestedConfig"></mw-shape-config>
            </template>
        </v-group>
    </template>
</template>
