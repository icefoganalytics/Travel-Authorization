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
        :flights="flights"
        :un-reconciled-flights="unReconciledFlights"
        :reconciled-flights="reconciledFlights"
        @updateTable="reloadData"
      ></router-view>
    </v-card-text>
  </v-card>
</template>

<script>
import { DateTime } from "luxon"

import http from "@/api/http-client"
import { TRAVEL_COM_URL, PROFILE_URL } from "@/urls"
import { greaterThanDate, lessThanDate } from "@/utils/validators"

export default {
  name: "FlightExpensesLayout",
  data() {
    return {
      flights: [],
      isLoading: false,
      reconciledFlights: [],
      unReconciledFlights: [],
      alertMsg: "",
      startDate: "",
      endDate: "",
    }
  },
  computed: {
    endDateMinusOneDay() {
      return DateTime.fromISO(this.endDate).minus({ days: 1 }).toISODate()
    },
    startDatePlusOneDay() {
      return DateTime.fromISO(this.startDate).plus({ days: 1 }).toISODate()
    },
  },
  async mounted() {
    this.endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) //1 months
    this.startDate = startDate.toISOString().slice(0, 10)
    this.alertMsg = ""
    this.reloadData()
  },
  methods: {
    greaterThanDate,
    lessThanDate,
    async getUserAuth() {
      return http
        .get(PROFILE_URL)
        .then((resp) => {
          this.$store.commit("auth/setUser", resp.data.user)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getFlights() {
      return http
        .get(`${TRAVEL_COM_URL}/flights/${this.startDate}/${this.endDate}`)
        .then((resp) => {
          console.log(resp.data)
          this.flights = resp.data
        })
        .catch((e) => {
          console.log(e)
        })
    },

    extractFlights() {
      this.reconciledFlights = []
      this.unReconciledFlights = []

      for (const flight of this.flights) {
        if (flight.reconciled) {
          this.reconciledFlights.push(flight)
        } else {
          this.unReconciledFlights.push(flight)
        }
      }
    },

    async search() {
      this.alertMsg = ""
      const start = new Date(this.startDate + "T01:00:00.000Z")
      const end = new Date(this.endDate + "T01:00:00.000Z")
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 60) {
        this.alertMsg =
          "If the Date Range is over 60 days, all records may not be displayed. Please use a shorter Date Range."
      }
      await this.reloadData()
    },

    async reloadData() {
      this.isLoading = true
      try {
        await this.getFlights()
        this.extractFlights()
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
