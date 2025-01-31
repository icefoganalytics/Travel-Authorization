<template>
  <!-- TODO: build a stock flight expenses table component -->
  <v-data-table
    v-model="selectedFlights"
    :headers="headers"
    :items="reconciledFlights"
    :items-per-page="15"
    dense
    item-key="invoiceDetailID"
    :show-select="isAdmin"
  >
    <template #top>
      <v-row>
        <v-spacer />
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            v-if="isAdmin"
            :disabled="selectedFlights.length == 0"
            color="primary"
            block
            @click="exportToExcel"
          >
            Export To Excel
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            :disabled="selectedFlights.length == 0"
            color="primary"
            block
            @click="openUnReconcile"
          >
            UnReconcile
          </v-btn>
        </v-col>
      </v-row>

      <!-- TODO: make this a component -->
      <v-dialog
        v-model="unReconcileDialog"
        persistent
        max-width="400px"
      >
        <v-card>
          <v-card-title
            class="warning"
            style="border-bottom: 1px solid black"
          >
            <div class="text-h5">Unreconcile Flights</div>
          </v-card-title>

          <v-card-text class="mt-4">
            By Unreconciling these records, the period will be removed and the record will be
            returned to the reconcile list.
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="grey darken-5"
              @click="unReconcileDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              class="ml-auto"
              :loading="savingData"
              color="green darken-1"
              @click="unReconcile"
            >
              Continue
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
        v-for="(flight, inx) in item.flightInfo.split(',')"
        :key="'flight-info-' + inx"
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

import http from "@/api/http-client"
import { FLIGHT_RECONCILE_URL } from "@/urls"

import capitalize from "@/utils/capitalize"
import formatCurrency from "@/utils/format-currency"
import formatDate from "@/utils/format-date"

import useCurrentUser from "@/use/use-current-user"

defineProps({
  reconciledFlights: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["updateTable"])

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
    text: "Reconcile Period",
    value: "reconcilePeriod",
    sortable: false,
  },
])

const selectedFlights = ref([])

const unReconcileDialog = ref(false)
const savingData = ref(false)

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
      reconcilePeriod: flight.reconcilePeriod ? flight.reconcilePeriod : "",
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

function openUnReconcile() {
  savingData.value = false
  unReconcileDialog.value = true
}

async function unReconcile() {
  savingData.value = true
  try {
    const body = []
    for (const flight of selectedFlights.value) {
      const reconcile = {
        reconcileID: flight.reconcileID,
        invoiceID: flight.invoiceID,
        invoiceDetailID: flight.invoiceDetailID,
        reconciled: false,
        reconcilePeriod: null,
      }
      body.push(reconcile)
    }

    await http.post(`${FLIGHT_RECONCILE_URL}/`, body)

    unReconcileDialog.value = false
    emit("updateTable")
  } catch (error) {
    console.log(`Failed to unReconcile flight expenses: ${error}`)
  } finally {
    savingData.value = false
  }
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
