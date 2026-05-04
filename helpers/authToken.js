import { getCookie } from "cookies-next";

export function authToken() {
    return getCookie("authToken") ?? "";
  }