<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ on }">
      <v-text-field
        :value="dateRangeText"
        :label="label"
        prepend-inner-icon="mdi-calendar"
        readonly
        v-bind="activatorProps"
        v-on="on"
        @click:clear="closeMenuAndEmitInput([])"
      ></v-text-field>
    </template>
    <v-date-picker
      :value="value"
      range
      @input="closeMenuAndEmitInput"
    ></v-date-picker>
  </v-menu>
</template>

<script setup>
import { computed, ref } from "vue"

const props = defineProps({
  value: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: "Pick date range",
  },
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["input"])

const showMenu = ref(false)

const dateRangeText = computed(() => props.value.join(" ~ "))

function closeMenuAndEmitInput(value) {
  emit("input", value)
}
</script>
