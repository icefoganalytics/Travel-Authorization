import { isString } from "lodash"

import { FORM_URL, LOOKUP_URL, DESTINATION_URL } from "@/urls"
import { secureGet, securePost, securePut } from "@/store/jwt"
import formsApi from "@/apis/forms-api"

const state = {
  emails: [],
  myForms: [],
  departments: [],
  purposes: [],
  destinations: [],
  request: {}, // TODO: make this name match the back-end object name.
}

const actions = {
  async initialize(store) {
    await store.dispatch("initializeForm")
    await store.dispatch("loadDepartments")
    await store.dispatch("loadPurposes")
    await store.dispatch("loadDestinations")
  },
  async emailSearch({ commit }, token) {
    if (isString(token) && token.length >= 3) {
      const { data: emails } = await secureGet(`${LOOKUP_URL}/emailList?email=${token}`)
      commit("SET_EMAILS", emails)
    } else {
      commit("SET_EMAILS", [])
    }
    return this.emails
  },
  async loadDepartments({ commit }) {
    return secureGet(`${LOOKUP_URL}/departmentList2`).then((resp) => {
      commit("SET_DEPARTMENTS", resp.data.data)
      return resp.data.data
    })
  },

  async loadPurposes({ commit }) {
    return secureGet(`${LOOKUP_URL}/travelPurpose`).then((resp) => {
      commit("SET_PURPOSE", resp.data)
      return resp.data
    })
  },

  async loadDestinations({ commit }) {
    return secureGet(`${DESTINATION_URL}`).then((resp) => {
      let destinations = []

      resp.data.forEach((v) => {
        destinations.push({
          value: v.id,
          text: v.city + " (" + v.province + ")",
        })
      })

      commit("SET_DESTINATIONS", destinations)

      return destinations
    })
  },

  async loadForms({ commit }, params) {
    return formsApi.list(params).then(({ forms, pageCount }) => {
      commit("SET_MYFORMS", forms)
      return { forms, pageCount }
    })
  },
  loadForm({ commit }, formId) {
    return formsApi.get(formId).then(({ form }) => {
      commit("SET_SELECTEDFORM", form)
      return form
    })
  },
  initializeForm({ commit }) {
    let form = {
      //personal info
      firstName: "",
      lastName: "",
      department: "",
      division: "",
      branch: "",
      unit: "",
      email: "",
      mailcode: "",
      supervisorEmail: "",
      multiStop: false,
      oneWayTrip: false,

      //stops
      stops: [],

      //travel details
      travelDuration: "1",
      daysOffTravelStatus: "0",
      dateBackToWork: "",
      travelAdvanceInCents: 0,
      purposeId: -1,
      eventName: "",
      summary: "",
      benefits: "",

      //other info
      status: "",
      requestChange: "",
      denialReason: "",
    }

    commit("SET_SELECTEDFORM", form)
  },
  async getAll() {
    return secureGet(FORM_URL).then((resp) => {
      return resp.data.data
    })
  },

  async getById(store, { id }) {
    return secureGet(`${FORM_URL}/${id}`).then((resp) => {
      return resp.data.data
    })
  },

  async create(store, { body }) {
    console.log(body)

    return securePost(FORM_URL, body).then((resp) => {
      return resp.data
    })
  },

  async update(store, { item }) {
    let id = item.id
    console.log(item)

    return securePut(`${FORM_URL}/${id}`, item).then((resp) => {
      return resp.data
    })
  },

  async delete(store, { id }) {
    return securePost(`${FORM_URL}/${id}`).then((resp) => {
      return resp.data
    })
  },
}

const mutations = {
  SET_EMAILS(store, value) {
    store.emails = value
  },
  SET_MYFORMS(store, value) {
    store.myForms = value
  },
  SET_SELECTEDFORM(store, value) {
    store.request = value
  },
  SET_DEPARTMENTS(store, value) {
    store.departments = value
  },
  SET_PURPOSE(store, value) {
    store.purposes = value
  },
  SET_DESTINATIONS(store, value) {
    store.destinations = value
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
