import { v4 as uuidv4 } from "uuid";

function isUserNew() {
  if (!window.localStorage.getItem("uuid")) {
    return true;
  } else {
    return false;
  }
}

function generateUserId() {
  window.localStorage.setItem("uuid", uuidv4());
  return window.localStorage.getItem("uuid");
}

export function getUserId() {
  if (isUserNew()) {
    return generateUserId();
  } else {
    return window.localStorage.getItem("uuid");
  }
}
