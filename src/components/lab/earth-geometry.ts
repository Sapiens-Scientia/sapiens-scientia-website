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
 * The finale camera that CONTINUES the orbit chart's viewpoint: the chart and
 * the globe share the same ecliptic frame (y = ecliptic north), and the chart
 * is viewed tilted by Rx(tilt) — so a camera at this constant position sees
 * the globe's sun at exactly the screen angle the chart's sun occupied, on
 * any date, with ecliptic north tipping up-and-away from the viewer.
 */
export function getChartContinuationCamera(tilt = 0.95, distance = 3.61) {
  return new THREE.Vector3(0, Math.sin(tilt) * distance, Math.cos(tilt) * distance);
}

/**
 * The Moon's real geocentric place, as an offset from the Sun: ecliptic
 * elongation (radians east of the Sun) and ecliptic latitude (radians).
 * Truncated Meeus/Almanac series, good to ~0.5° — plenty to put the Moon on
 * the correct side of the sky with the correct phase. In the globe scene's
 * ecliptic frame (y = ecliptic north), rotate the rendered sun direction
 * about +y by the elongation, then lift by the latitude.
 */
export function getMoonEclipticOffset(date: Date) {
  const rad = Math.PI / 180;
  // Julian centuries from J2000
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525;
  const D = (297.8501921 + 445267.1114034 * T) * rad; // mean elongation
  const M = (357.5291092 + 35999.0502909 * T) * rad; // sun mean anomaly
  const Mp = (134.9633964 + 477198.8675055 * T) * rad; // moon mean anomaly
  const F = (93.272095 + 483202.0175233 * T) * rad; // argument of latitude
  const Lp = 218.3164477 + 481267.88123421 * T; // moon mean longitude (deg)
  const moonLon =
    Lp +
    6.289 * Math.sin(Mp) +
    1.274 * Math.sin(2 * D - Mp) +
    0.658 * Math.sin(2 * D) -
    0.214 * Math.sin(2 * Mp) -
    0.186 * Math.sin(M) -
    0.114 * Math.sin(2 * F);
  const sunLon = 280.4664567 + 36000.76982779 * T + 1.915 * Math.sin(M) + 0.02 * Math.sin(2 * M);
  const latitude = (5.128 * Math.sin(F) + 0.281 * Math.sin(Mp + F)) * rad;
  // wrap to (-π, π] so the shorter way around is explicit
  let elongation = ((moonLon - sunLon) * rad) % (Math.PI * 2);
  if (elongation > Math.PI) elongation -= Math.PI * 2;
  if (elongation <= -Math.PI) elongation += Math.PI * 2;
  return { elongation, latitude };
}
