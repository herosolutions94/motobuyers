import axios from "axios";

let authToken =
  typeof window !== "undefined" ? window.localStorage.getItem("authToken") : "";
export default axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}api/`,
  headers: {
    Authorization: ``
  }
});
