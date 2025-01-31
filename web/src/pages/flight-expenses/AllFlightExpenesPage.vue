<template>
  <!-- TODO: build a stock flight expenses table component -->
  <v-data-table
    v-model="selectedFlights"
    :headers="headers"
    :items="flights"
    :items-per-page="15"
    dense
    item-key="invoiceDetailID"
    :show-select="isAdmin"
  >
    <template #top>
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
    <template #item.purchaseDate="{ item }">
      {{ formatDate(item.purchaseDate) }}
    </template>

    <template #item.agent="{ item }">
      {{ capitalize(item.agent) }}
    </template>

    <template #item.airline="{ item }">
      {{ capitalize(item.airline) }}
    </template>

    <template #item.travelerFirstName="{ item }">
      {{ capitalize(item.travelerFirstName) }}
    </template>

    <template #item.travelerLastName="{ item }">
      {{ capitalize(item.travelerLastName) }}
    </template>

    <template #item.flightInfo="{ item }">
      <div
        v-for="(flight, index) in item.flightInfo.split(',')"
        :key="'flight-info-' + index"
        style="line-height: 1rem"
      >
        {{ flight }}
      </div>
    </template>
    <template #item.cost="{ item }"> {{ formatCurrency(item.cost) }} </template>
    <template #item.reconciled="{ item }">
      <div class="text-center">
        <v-icon
          v-if="item.reconciled"
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
import { ref } from "vue"
import { ExportToCsv } from "export-to-csv"

import capitalize from "lodash/capitalize"
import formatCurrency from "@/utils/format-currency"
import formatDate from "@/utils/format-date"
import useCurrentUser from "@/use/use-current-user"

defineProps({
  flights: {
    type: Array,
    default: () => [],
  },
})

const { isAdmin } = useCurrentUser()

const headers = ref([
  {
    text: "Purchase Date",
    value: "purchaseDate",
    sortable: false,
  },
  {
    text: "Cost",
    value: "cost",
    sortable: false,
  },
  {
    text: "Agent",
    value: "agent",
    sortable: false,
  },
  {
    text: "Airline",
    value: "airline",
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
    value: "dept",
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
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
