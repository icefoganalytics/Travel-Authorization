<template>
  <v-card :loading="isLoading">
    <v-card-title>
      <h2 class="mb-md-0">Flight Expenses</h2>
    </v-card-title>
    <v-card-text>
      <v-row class="d-flex align-center">
        <v-spacer />
        <v-col
          cols="12"
          md="3"
        >
          <DatePickerRangeDialog
            v-model="dateRange"
            label="Records date range"
            :activator-props="{
              clearable: true,
              outlined: true,
              dense: true,
              hideDetails: true,
            }"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            class="my-0"
            color="primary"
            block
            primary
            @click="clearDateRange"
          >
            <v-icon
              small
              left
              >mdi-close</v-icon
            >
            Clear
          </v-btn>
        </v-col>
      </v-row>
      <v-tabs
        class="mt-8"
        active-class="primary--text teal lighten-5"
        show-arrows
      >
        <v-tab
          :to="{
            name: 'flight-expenses/AllFlightExpenesPage',
          }"
        >
          Flights
        </v-tab>
        <v-tab
          :to="{
            name: 'flight-expenses/UnreconciledFlightExpensesPage',
          }"
        >
          Unreconciled
        </v-tab>
        <v-tab
          :to="{
            name: 'flight-expenses/ReconciledFlightExpensesPage',
          }"
        >
          Reconciled
        </v-tab>
      </v-tabs>

      <v-alert
        v-if="alertMsg"
        dense
        class="mt-5"
        color="warning"
        dismissible
        >{{ alertMsg }}</v-alert
      >

      <!-- TODO: make each tab load its own data via composable -->
      <router-view
        :start-date="startDate"
        :end-date="endDate"
        :un-reconciled-flights="unReconciledFlights"
        :reconciled-flights="reconciledFlights"
        @updateTable="refresh"
      ></router-view>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { DateTime } from "luxon"

import http from "@/api/http-client"
import { TRAVEL_COM_URL } from "@/urls"

import DatePickerRangeDialog from "@/components/common/DatePickerRangeDialog.vue"

const flights = ref([])
const reconciledFlights = computed(() => flights.value.filter((flight) => flight.reconciled))
const unReconciledFlights = computed(() => flights.value.filter((flight) => !flight.reconciled))

const alertMsg = ref("")

const isLoading = ref(false)

const dateRange = ref([
  DateTime.local().toISODate(),
  DateTime.local().minus({ days: 1 }).toISODate(),
])

const startDate = computed(() => dateRange.value[0])
const endDate = computed(() => dateRange.value[1])

function clearDateRange() {
  dateRange.value = []
}

onMounted(async () => {
  await getFlights()
})

async function getFlights() {
  isLoading.value = true
  try {
    const { data: newFlights } = await http.get(
      `${TRAVEL_COM_URL}/flights/${startDate.value}/${endDate.value}`
    )
    flights.value = newFlights || []
  } catch (error) {
    console.log(`Failed to load flights: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function refresh() {
  return getFlights()
}
</script>
