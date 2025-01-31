<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="arInvoices"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    :show-select="isAdmin"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #top="slotProps">
      <slot
        name="top"
        :is-admin="isAdmin"
        v-bind="slotProps"
      ></slot>
    </template>
    <!--
    agent: agent,
    flightInfo: flightInfo.join(","),
    finalDestination: lastLegCity,
    travelerFirstName: name[1],
    travelerLastName: name[0],
    -->
    <template #item.bookingDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.agent="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.vendorName="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.travelerFirstName="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.travelerLastName="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.flightInfo="{ item }">
      <div
        v-for="(flight, index) in item.flightInfo?.split(',')"
        :key="'flight-info-' + index"
        style="line-height: 1rem"
      >
        {{ flight }}
      </div>
    </template>
    <template #item.sellingFare="{ value }"> {{ formatCurrency(value) }} </template>
    <template #item.reconciled="{ value }">
      <div class="text-center">
        <v-icon
          v-if="value"
          color="success"
          >mdi-checkbox-marked</v-icon
        >
        <v-icon
          v-else
          color="warning"
          >mdi-close-box</v-icon
        >
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"

import { capitalize, formatCurrency, formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useCurrentUser from "@/use/use-current-user"
import useArInvoices from "@/use/trav-com/use-ar-invoices"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
})

const { isAdmin } = useCurrentUser()

const headers = ref([
  {
    text: "Purchase Date",
    value: "bookingDate",
    sortable: false,
  },
  {
    text: "Cost",
    value: "sellingFare",
    sortable: false,
  },
  {
    text: "Agent",
    value: "agent",
    sortable: false,
  },
  {
    text: "Airline",
    value: "vendorName",
    sortable: false,
  },
  {
    text: "Flight Info",
    value: "flightInfo",
    sortable: false,
  },
  {
    text: "Final Destination",
    value: "finalDestination",
    sortable: false,
  },
  {
    text: "Department",
    value: "department",
    sortable: false,
  },
  {
    text: "Traveler First Name",
    value: "travelerFirstName",
    sortable: false,
  },
  {
    text: "Traveler Last Name",
    value: "travelerLastName",
    sortable: false,
  },
  {
    text: "Reconciled",
    value: "reconciled",
    sortable: false,
  },
])

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "BookingDate",
    order: "desc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const arInvoicesQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { arInvoices, totalCount, isLoading, refresh } = useArInvoices(arInvoicesQuery)

defineExpose({
  refresh,
})
</script>
