import { ref, reactive, computed } from "vue";
import {
    db,
    dbRef,
    onChildAdded,
    onValue,
    child,
    get,
    update,
} from "src/boot/firebase";

const tracker = reactive({ data: {} });
const heading = ref(0);
const driverName = ref("");
const trackingStatus = ref("");
const center = reactive({ lat: 0, lng: 0 });
const routeCoords = reactive({ coords: [] });
const badTrackerId = ref(false);
const lastUpdated = ref(0);
const dbBasePath = "trackers";

const driverStarted = computed(() => {
    return routeCoords.coords?.length > 0;
});

const appendToCoords = (newCoords) => routeCoords.coords.push(newCoords);

const refresh = (params) => {
    tracker.data = {};
    heading.value = 0;
    trackingStatus.value = "";
    routeCoords.coords = [];
    getTrackerObject(params);
};

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}

function calcHeading(startPoint, endPoint) {
    const startLat = toRadians(startPoint.lat);
    const startLng = toRadians(startPoint.lng);
    const destLat = toRadians(endPoint.lat);
    const destLng = toRadians(endPoint.lng);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x =
        Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    brng = (brng + 360) % 360;

    return brng < 180 ? brng + 180 : brng - 180;
}

async function trackerIdExists(trackerId) {
    return new Promise(async (resolve, reject) => {
        get(dbRef(db, `${dbBasePath}/${trackerId}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    resolve(true);
                    reject();
                    return;
                }
            })
            .catch((err) => {
                console.log("err: ", err);
                reject(err);
                return;
            });
    });
}

function getTrackerObject(params) {
    return new Promise((resolve, reject) => {
        const trackerRef = dbRef(db, `${dbBasePath}/${params.trackerId}`);
        if (!params.trackerId) {
            reject("No tracking ID");
            return;
        }
        get(trackerRef)
            .then((snapshot) => {
                if (snapshot.val()) {
                    tracker.data = snapshot.val();
                    driverName.value = tracker.data.driverData?.name;
                    trackingStatus.value = tracker.data.status;

                    onChildAdded(child(trackerRef, "coords"), (snapshot) => {
                        let newCoords = snapshot.val();
                        let lastIdx;
                        lastUpdated.value = newCoords.time;

                        center.lat = newCoords.latitude;
                        center.lng = newCoords.longitude;
                        appendToCoords({
                            lat: newCoords.latitude,
                            lng: newCoords.longitude,
                        });
                        if (routeCoords.coords.length > 1) {
                            lastIdx = routeCoords.coords.length - 1;
                            heading.value = calcHeading(
                                routeCoords.coords[lastIdx],
                                routeCoords.coords[lastIdx - 1]
                            );
                        }
                    });
                }
                resolve(snapshot);
                return;
            })
            .catch((err) => {
                console.log("err: ", err);
                reject(err);
            });
    });
}
function firebaseInit(params) {
    return new Promise(async (resolve, reject) => {
        const trackerRef = dbRef(db, `${dbBasePath}/${params.trackerId}`);
        try {
            const trackerObject = await getTrackerObject(params);

            if (!trackerObject.val()) {
                badTrackerId.value = true;
                reject();
                return;
            }

            onValue(child(trackerRef, "status"), (snapshot) => {
                let statusData = snapshot.val();
                if (typeof statusData != undefined && statusData != null) {
                    trackingStatus.value = statusData;
                    update(trackerRef, { recipientOpened: true });
                }
            });
            resolve();
        } catch (e) {
            badTrackerId.value = true;
            reject();
            return;
        }
    });
}

export {
    center,
    driverName,
    trackingStatus,
    routeCoords,
    heading,
    firebaseInit,
    trackerIdExists,
    refresh,
    lastUpdated,
    badTrackerId,
    driverStarted,
    appendToCoords,
};
