import test from "node:test";
import assert from "node:assert/strict";
import { gmapsActivityUrl } from "../src/utils/gmaps.js";

test("gmapsActivityUrl produces exact coordinate query when coordinates are present", () => {
  const actWithLatLong = {
    locationName: "Suvarnabhumi Airport",
    latitude: 13.69,
    longitude: 100.7501,
  };
  assert.equal(
    gmapsActivityUrl(actWithLatLong, "Bangkok"),
    "https://www.google.com/maps/search/?api=1&query=13.69,100.7501"
  );

  const actWithShortKeys = {
    locationName: "Keflavik Airport",
    lat: 63.985,
    lng: -22.6056,
  };
  assert.equal(
    gmapsActivityUrl(actWithShortKeys, "Iceland"),
    "https://www.google.com/maps/search/?api=1&query=63.985,-22.6056"
  );
});

test("gmapsActivityUrl produces encoded search query when coordinates are missing", () => {
  const actNoCoords = {
    locationName: "Clarion Hotel Copenhagen Airport",
  };
  const url = gmapsActivityUrl(actNoCoords, "Denmark");
  assert.ok(url.startsWith("https://www.google.com/maps/search/?api=1&query="));
  assert.ok(url.includes("Clarion%20Hotel%20Copenhagen%20Airport"));
  assert.ok(url.includes("Denmark"));
});

test("gmapsActivityUrl handles null or missing activity safely", () => {
  assert.equal(gmapsActivityUrl(null), "https://www.google.com/maps");
  assert.equal(gmapsActivityUrl({}), "https://www.google.com/maps/search/?api=1&query=Google%20Maps");
});
