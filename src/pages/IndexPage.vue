<template>
  <q-page class="flex flex-center">
    <q-page-sticky
      position="top-right"
      :offset="[10, 10]"
      style="z-index: 1000"
      v-if="!badTrackerId"
    >
      <q-card class="bg-primary">
        <q-item
          id="refresh-btn"
          class="q-pa-none"
          dense
          clickable
          v-ripple
          @click="onRefresh"
        >
          <q-item-section class="row items-center">
            <q-icon
              name="refresh"
              color="white"
              size="md"
              class="q-py-none q-px-md"
            />
            <q-item-section
              v-show="lastUpdated > 0"
              class="text-white q-px-xs q-my-none"
            >
              <span v-if="lastSeen">{{ lastSeen }}</span>
            </q-item-section>
          </q-item-section>
        </q-item>
      </q-card>
    </q-page-sticky>
    <q-page-sticky
      position="bottom-left"
      :offset="[10, 0]"
      style="z-index: 1000"
      ><a href="https://apps.apple.com/us/app/on-my-way-texts/id1640130719"
        ><q-icon
          name="img:icons/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
          size="8rem"
        />
      </a>
    </q-page-sticky>
    <div
      v-if="!isTracker || badTrackerId"
      class="window-height bg-dark column justify-center text-white col"
    >
      <div class="row full-width flex-center text-h2 text-center">
        Nothing to see here
      </div>
    </div>
    <div v-else-if="!driverStarted">
      <div class="row fit flex-center text-h2 text-center">
        <q-spinner-rings color="primary" size="5em" />
      </div>
    </div>
    <div
      v-show="isTracker && driverStarted"
      ref="map"
      id="map"
      class="fit absolute"
    ></div>
  </q-page>
</template>

<script>
import { defineComponent, watch, ref, onMounted, computed } from "vue";
import {
  center,
  routeCoords,
  heading,
  firebaseInit,
  trackerIdExists,
  refresh,
  lastUpdated,
  trackingStatus,
  badTrackerId,
  driverStarted,
} from "src/composables/firebase";
import { Loader } from "@googlemaps/js-api-loader";
import { useRoute } from "vue-router";
import { date } from "quasar";
const { getDateDiff } = date;

export default defineComponent({
  name: "IndexPage",
  setup() {
    const route = useRoute();
    const isTracker = ref(true);
    const lastSeen = ref("");

    const loader = new Loader({
      apiKey: process.env.GOOGLE_API_KEY,
      version: "weekly",
    });

    let googleMap, flightPath, icon, marker;
    const setLastSeen = () => {
      if (trackingStatus.value == "inProgress" && lastUpdated.value) {
        let start = new Date(lastUpdated.value);
        let end = new Date().getTime();
        let diff = getDateDiff(end, start, "minutes");
        if (diff == Number(NaN)) {
          lastSeen.value = "";
        } else if (diff == 0) {
          diff = getDateDiff(end, start, "seconds");
          if (diff < 10) {
            lastSeen.value = "Now";
          } else {
            lastSeen.value = `${diff}s ago`;
          }
        } else {
          let hours = Math.floor(diff / 60);
          let minutes = diff % 60;
          lastSeen.value = hours ? `${hours}h ago` : `${minutes}m ago`;
        }
      }
      setTimeout(setLastSeen, 500);
    };
    setLastSeen();

    const loadMap = () => {
      if (!loader.done) {
        return;
      }
      googleMap = new google.maps.Map(document.getElementById("map"), {
        center: { lat: center.lat, lng: center.lng },
        zoom: 15,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      });
      flightPath = new google.maps.Polyline({
        path: routeCoords.coords,
        geodesic: true,
        strokeColor: "#CC444B",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      flightPath.setMap(googleMap);
      icon = {
        anchor: new google.maps.Point(24, 24),
        fillColor: "#5F9BAB",
        fillOpacity: 1,
        strokeColor: "#5F9BAB",
        path: "M 24,1.6546763 9,40 12.876,40.925 24,34.742037 35.124,40.925 39,40 Z",
        rotation: 90,
      };
      marker = new google.maps.Marker({
        position: googleMap.getCenter(),
        icon: icon,
        map: googleMap,
      });
    };

    onMounted(() => {
      trackerIdExists(route.params.trackerId).then((isTrackerResp) => {
        isTracker.value = isTrackerResp;
        if (isTrackerResp) {
          firebaseInit(route.params).then(() => {
            loader.load().then(() => {
              if (driverStarted.value) {
                loadMap();
              }
            });
          });
        }
      });
    });

    watch(routeCoords, (newValue) => {
      if (!googleMap && driverStarted) {
        loadMap();
      }
      if (flightPath) {
        flightPath.setPath(newValue.coords);
      }
    });
    watch(center, (newValue, prevValue) => {
      if (!googleMap?.getBounds()) {
        return;
      }
      if (
        !googleMap
          .getBounds()
          .contains({ lat: newValue.lat, lng: newValue.lng })
      ) {
        googleMap.panTo({ lat: newValue.lat, lng: newValue.lng });
      }
      if (marker)
        marker.setPosition({
          lat: newValue.lat,
          lng: newValue.lng,
        });
    });
    watch(heading, (newValue, prevValue) => {
      if (icon) {
        icon.rotation = heading.value;
      }
      if (marker) {
        marker.setIcon(icon);
      }
    });

    return {
      isTracker,
      onRefresh: () => refresh(route.params),
      lastSeen,
      lastUpdated,
      badTrackerId,
      driverStarted,
    };
  },
});
</script>
<style lang="sass" scoped>
.map
    width: 100%
    min-height: 100vh
    min-height: -webkit-fill-available
    height: 100vh
</style>
