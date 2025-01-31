<template>
  <v-card :loading="isLoading">
    <v-card-title>
      <h2 class="mb-md-0">Flight Expenses</h2>
    </v-card-title>
    <v-card-text>
      <v-row class="d-flex align-baseline">
        <v-spacer />
        <v-col
          cols="12"
          md="2"
        >
          <b>Records Date Range:</b>
        </v-col>
        <!-- TODO: use Vuetify a date range picker see https://v2.vuetifyjs.com/en/components/date-pickers/#range -->
        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="startDate"
            type="date"
            label="Start Date"
            :rules="[lessThanDate(endDate, { referenceFieldLabel: 'end date' })]"
            :max="endDateMinusOneDay"
            dense
            outlined
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-text-field
            v-model="endDate"
            :rules="[greaterThanDate(startDate, { referenceFieldLabel: 'start date' })]"
            :min="startDatePlusOneDay"
            type="date"
            label="End Date"
            dense
            outlined
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
            @click="search"
          >
            Search
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
import { greaterThanDate, lessThanDate } from "@/utils/validators"

const flights = ref([])
const reconciledFlights = computed(() => flights.value.filter((flight) => flight.reconciled))
const unReconciledFlights = computed(() => flights.value.filter((flight) => !flight.reconciled))

const alertMsg = ref("")

const isLoading = ref(false)

const startDate = ref("")
const endDate = ref("")

const endDateMinusOneDay = computed(() => {
  return DateTime.fromISO(endDate.value).minus({ days: 1 }).toISODate()
})
const startDatePlusOneDay = computed(() => {
  return DateTime.fromISO(startDate.value).plus({ days: 1 }).toISODate()
})

onMounted(() => {
  endDate.value = DateTime.local().toISODate()
  startDate.value = DateTime.fromISO(endDate.value).minus({ days: 1 }).toISODate()

  alertMsg.value = ""
  refresh()
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

async function search() {
  alertMsg.value = ""

  // TODO: replace this with date max/min restraints, or paginate data.
  const diffDays = DateTime.fromISO(endDate.value).diff(
    DateTime.fromISO(startDate.value),
    "days"
  ).days
  if (diffDays > 60) {
    alertMsg.value =
      "If the Date Range is over 60 days, not all records may displayed. Please use a shorter Date Range."
  }
  await refresh()
}
</script>
