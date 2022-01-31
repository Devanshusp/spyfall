import { locationMap } from "./Locations";

export function getLocationData() {
  const map = getRandomLocation();
  const location = map[0];
  const roles = shuffleArray(map[1]);
  return [location, roles];
}

function getRandomLocation() {
  const mapSize = locationMap.size;
  const locationIndex = Math.floor(Math.random() * mapSize);
  return [...locationMap][locationIndex];
}

function shuffleArray(array) {
  let length = array.length;
  while (0 !== length) {
    let randId = Math.floor(Math.random() * length);
    length -= 1;
    let tmp = array[length];
    array[length] = array[randId];
    array[randId] = tmp;
  }
  return array;
}
