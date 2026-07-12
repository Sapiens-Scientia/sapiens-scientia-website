import * as THREE from "three";

// Pure geometry shared between the You Are Here journey and LabEarthView:
// the finale globe's home-focused camera, and where its sun lands on screen —
// so the outgoing orbit chart can be yawed to hand off with the sun pointing
// the same way. Formulas mirror the site's EarthView scene exactly.

export type LabEarthCoords = { lat: number; lng: number };

const AXIAL_TILT_RAD = (23.44 * Math.PI) / 180;
const ECLIPTIC_NORTH = new THREE.Vector3(0, 1, 0);

function getOrbitalProgress(date: Date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  return (date.getTime() - start) / (end - start);
}

function getProgressForDate(year: number, monthIndex: number, day: number) {
  return getOrbitalProgress(new Date(year, monthIndex, day));
}

function orbitPoint(progress: number, radius = 1, y = 0) {
  const angle = progress * Math.PI * 2 + Math.PI / 2;
  return new THREE.Vector3(Math.cos(angle) * radius, y, -Math.sin(angle) * radius);
}

function getSunDirectionFromEarth(progress: number) {
  return orbitPoint(progress, 1).multiplyScalar(-1).normalize();
}

function latLngToEarthPoint(lat: number, lng: number, radius = 1) {
  const latRad = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(lat, -89.9, 89.9));
  const lngRad = THREE.MathUtils.degToRad(lng + 180);
  const cosLat = Math.cos(latRad);
  return new THREE.Vector3(
    -Math.cos(lngRad) * cosLat * radius,
    Math.sin(latRad) * radius,
    Math.sin(lngRad) * cosLat * radius,
  );
}

function makeEarthTiltQuaternion(year: number) {
  const winterProgress = getProgressForDate(year, 11, 21);
  const tiltToward = orbitPoint(winterProgress, 1).normalize();
  const tiltAxis = new THREE.Vector3().crossVectors(ECLIPTIC_NORTH, tiltToward).normalize();
  return new THREE.Quaternion().setFromAxisAngle(tiltAxis, AXIAL_TILT_RAD);
}

function getNorthHaloAngle(year: number) {
  const northAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(makeEarthTiltQuaternion(year));
  return Math.atan2(-northAxis.z, northAxis.x);
}

function getSunAnchoredHaloAngle(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const progress = getOrbitalProgress(referenceDate);
  const summer = getProgressForDate(year, 5, 21);
  return getNorthHaloAngle(year) - (summer - progress) * Math.PI * 2;
}

function getSunAnchoredNorthDirection(date: Date, anchorAngle = getSunAnchoredHaloAngle()) {
  const year = date.getFullYear();
  const progress = getOrbitalProgress(date);
  const summer = getProgressForDate(year, 5, 21);
  const angle = anchorAngle - (progress - summer) * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).normalize();
}

function makeEarthTiltQuaternionForNorthDirection(direction: THREE.Vector3) {
  const northAxis = direction.clone().setY(0).normalize().multiplyScalar(Math.sin(AXIAL_TILT_RAD));
  northAxis.y = Math.cos(AXIAL_TILT_RAD);
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), northAxis.normalize());
}

function getDailySpinAngle(date: Date, earthTiltQuaternion: THREE.Quaternion, sunDirection: THREE.Vector3) {
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 +
    date.getUTCMilliseconds() / 3600000;
  const localSun = sunDirection.clone().applyQuaternion(earthTiltQuaternion.clone().invert());
  const noonOffset = Math.atan2(-localSun.z, localSun.x);
  return noonOffset + ((utcHours - 12) / 24) * Math.PI * 2;
}

/**
 * Globe-mode camera aimed at a home location instead of the subsolar face:
 * replicates EarthBody's tilt+spin stack so the home point's world direction
 * is exact at the given moment.
 */
export function getHomeFocusCamera(coords: LabEarthCoords, date = new Date()) {
  const north = getSunAnchoredNorthDirection(date, getSunAnchoredHaloAngle(date));
  const tiltQuaternion = makeEarthTiltQuaternionForNorthDirection(north);
  const spin = getDailySpinAngle(date, tiltQuaternion, getSunDirectionFromEarth(getOrbitalProgress(date)));
  return latLngToEarthPoint(coords.lat, coords.lng, 1)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), spin)
    .applyQuaternion(tiltQuaternion)
    .normalize()
    .multiplyScalar(3.61);
}

/**
 * Where the finale globe's sun sits on screen (angle in the view plane,
 * counter-clockwise from screen-right, screen-up positive), given the
 * home-focused camera looking at the globe with world +y as up.
 */
export function getFinaleSunScreenAngle(coords: LabEarthCoords, date = new Date()) {
  const zAxis = getHomeFocusCamera(coords, date).normalize();
  const xAxis = new THREE.Vector3().crossVectors(ECLIPTIC_NORTH, zAxis).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis);
  const sun = getSunDirectionFromEarth(getOrbitalProgress(date));
  return Math.atan2(sun.dot(yAxis), sun.dot(xAxis));
}

/**
 * The finale camera that continues the orbit chart's viewpoint — same
 * ecliptic frame, same elevation — with its azimuth set exactly opposite the
 * direction Earth's axis tips (the winter-solstice direction, constant in
 * this frame). The north arrow therefore projects perfectly vertical on
 * screen, leaning straight away from the viewer, and the sun lands within a
 * few degrees of where the chart's sun was — on any date.
 */
export function getChartContinuationCamera(date = new Date(), tilt = 0.95, distance = 3.61) {
  const northAngle = getNorthHaloAngle(date.getFullYear());
  const away = new THREE.Vector3(-Math.cos(northAngle), 0, Math.sin(northAngle));
  return away
    .multiplyScalar(Math.cos(tilt) * distance)
    .add(new THREE.Vector3(0, Math.sin(tilt) * distance, 0));
}

/**
 * The matching yaw for the orbit chart (applied about ecliptic north, before
 * its tilt): squaring the continuation camera to Earth's axis moved its
 * azimuth off the chart's default viewpoint by this same constant angle, so
 * the chart must turn with it for the handoff to stay an exact frame
 * continuation. Constant year-round, like the camera.
 */
export function getChartContinuationYaw(date = new Date()) {
  return Math.PI / 2 - getNorthHaloAngle(date.getFullYear());
}
