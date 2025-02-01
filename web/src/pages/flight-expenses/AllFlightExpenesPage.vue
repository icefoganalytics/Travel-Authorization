<template>
  <ArInvoicesDataTable
    v-model="selectedFlights"
    :filters="filters"
  >
    <template #top="{ isAdmin }">
      <v-row v-if="isAdmin">
        <v-spacer />
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            :disabled="selectedFlights.length == 0"
            color="primary"
            block
            @click="exportToExcel"
          >
            Export To Excel
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </ArInvoicesDataTable>
</template>

<script setup>
import { computed, ref } from "vue"
import { ExportToCsv } from "export-to-csv"
import { isNil, isEmpty } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import ArInvoicesDataTable from "@/components/trav-com/ar-invoices/ArInvoicesDataTable.vue"

const props = defineProps({
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
})

const betweenFilters = computed(() => {
  if (
    isNil(props.startDate) ||
    isEmpty(props.startDate) ||
    isNil(props.endDate) ||
    isEmpty(props.endDate)
  ) {
    return {}
  }

  return {
    between: [props.startDate, props.endDate],
  }
})
const filters = computed(() => ({
  ...betweenFilters.value,
}))

const selectedFlights = ref([])

// TODO: switch to back-end rendering at a dedicated endpoint via
// fast-csv, see https://github.com/icefoganalytics/internal-data-portal/blob/0eb01fff60c6b5d72b060f89e92cf15336225531/api/src/controllers/download/datasets-controller.ts#L28
async function exportToExcel() {
  const csvInfo = selectedFlights.value.map((flight) => {
    return {
      purchaseDate: flight.purchaseDate ? flight.purchaseDate : "",
      cost: flight.cost ? "$" + flight.cost : "",
      agent: flight.agent ? flight.agent : "",
      airline: flight.airline ? flight.airline : "",
      flightInfo: flight.flightInfo ? flight.flightInfo : "",
      finalDestination: flight.finalDestination ? flight.finalDestination : "",
      department: flight.dept ? flight.dept : "",
      travelerFirstName: flight.travelerFirstName ? flight.travelerFirstName : "",
      travelerLastName: flight.travelerLastName ? flight.travelerLastName : "",
      reconciled: flight.reconciled ? "Yes" : "No",
    }
  })
  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    title: "",
    filename: "Flights",
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: false,
    headers: [
      "Purchase Date",
      "Cost",
      "Agent",
      "Airline",
      "Flight Info",
      "Final Destination",
      "Department",
      "Traveler First Name",
      "Traveler last Name",
      "Reconciled",
    ],
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}

useBreadcrumbs([
  {
    text: "Flight Expenses",
    to: {
      name: "flight-expenses/AllFlightExpenesPage",
    },
  },
  {
    text: "All Flights Expenses",
    to: {
      name: "flight-expenses/AllFlightExpenesPage",
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
