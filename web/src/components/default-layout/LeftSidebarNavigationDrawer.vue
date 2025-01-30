<template>
  <v-navigation-drawer
    :value="showDrawer"
    v-bind="$attrs"
    v-on="$listeners"
    @input="emit('update', $event)"
  >
    <v-list>
      <v-list-item to="/dashboard">
        <v-list-item-icon>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'my-travel-requests/MyTravelRequestsPage',
        }"
      >
        <v-list-item-icon>
          <v-icon>mdi-airplane</v-icon>
        </v-list-item-icon>
        <v-list-item-title>My Travel Requests</v-list-item-title>
      </v-list-item>

      <v-list-item to="/preapproved">
        <v-list-item-icon>
          <v-icon>mdi-check-circle</v-icon>
        </v-list-item-icon>
        <v-list-item-title>PreApproved</v-list-item-title>
      </v-list-item>

      <v-list-item to="/travel-desk">
        <v-list-item-icon>
          <v-icon>mdi-desk-lamp</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Travel Desk</v-list-item-title>
      </v-list-item>

      <v-list-item to="/travel-request">
        <v-list-item-icon>
          <v-icon>mdi-file-document-edit</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Travel Request</v-list-item-title>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'FlightExpenseHome',
        }"
      >
        <v-list-item-icon>
          <v-icon>mdi-cash</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Flight Expense</v-list-item-title>
      </v-list-item>

      <v-list-item to="/reporting-summary">
        <v-list-item-icon>
          <v-icon>mdi-chart-bar</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Reports</v-list-item-title>
      </v-list-item>

      <v-list-item
        :to="{
          name: 'ManageTravelRequests',
        }"
      >
        <v-list-item-icon>
          <v-icon>mdi-account-tie</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Manage Travel Requests</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="isInDevelopmentOrUserAcceptanceTesting"
        :to="{ name: 'Qa-Scenarios' }"
      >
        <v-list-item-icon>
          <v-icon>mdi-tools</v-icon>
        </v-list-item-icon>
        <v-list-item-title>QA Scenarios</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  model: {
    prop: "showDrawer",
    event: "update",
  },
}
</script>

<script setup>
import { computed } from "vue"

import { ENVIRONMENT } from "@/config"

defineProps({
  showDrawer: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update"])

const isInDevelopmentOrUserAcceptanceTesting = computed(() => {
  return (
    ENVIRONMENT === "development" || window.location.hostname === "travel-auth-dev.ynet.gov.yk.ca"
  )
})
</script>
