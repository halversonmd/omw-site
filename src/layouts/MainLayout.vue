<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="row justify-between">
        <div class="col-1"></div>
        <q-item
          v-if="driverName && driverName.length > 0"
          class="column col-10 items-center"
        >
          <div v-if="trackingStatus.length" class="text-center">
            <q-item-section v-if="trackingStatus === 'inProgress'">
              <div class="text-h6" v-if="!driverStarted">
                Waiting for {{ driverName }} to start
              </div>
              <div class="text-h6" v-else>{{ driverName }} is on the way</div>
            </q-item-section>
            <q-item-section v-else>
              <div v-if="driverName" class="text-h6">
                Tracking for {{ driverName }} ended
              </div>
              <div v-else class="text-h6">Tracking ended</div>
            </q-item-section>
          </div>
        </q-item>
        <div class="column col-1 items-end">
          <q-icon name="img:icons/logo_white_no_shadow.svg" size="md" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import {
  driverName,
  trackingStatus,
  driverStarted,
} from "src/composables/firebase";
export default defineComponent({
  name: "MainLayout",
  setup() {
    return { driverName, trackingStatus, driverStarted };
  },
});
</script>
