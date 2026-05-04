// import { getCookie } from "cookies-next";
import axios from "axios";
// import moment from "moment";
// import FormData from "form-data";
// import variables from "styles/globals.module.scss";
import http from "./http";

export function doObjToFormData(obj) {
  let formData = new FormData();
  for (var key in obj) {
    if (Array.isArray(obj[key])) {
      for (let [keyv, value] of Object.entries(obj[key])) {
        formData.append(key + "[]", JSON.stringify(value));
      }
    } else {
      if (typeof obj[key] == "object") {
        formData.append(key, JSON.stringify(obj[key]));
      } else {
        formData.append(key, obj[key]);
      }
    }
  }
  return formData;
}

export const fileValidation = (file) => {
  const allowedTypes = [
    "application/pdf", // .pdf
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "image/png", // .png
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: "Invalid file type." };
  }

  if (file.size > maxSize) {
    return { valid: false, message: "File size exceeds limit." };
  }

  return { valid: true };
};

export async function ImageUpload(event, type = "attchments", file_name) {
  const fd = new FormData();
  fd.append("file", event);
  fd.append("type", type);
  fd.append("file_name", file_name);

  return http.post("upload_file", fd).then((res) => {
    return res.data;
  });
}

// export const ImageUpload = async (file) => {
//   // dummy uploader
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch("/api/upload_file", {
//     method: "POST",
//     body: formData,
//   });

//   return await response.json();
// };

export function doObjToFormDataWithoutString(obj) {
  var formData = new FormData();
  for (var key in obj) {
    if (Array.isArray(obj[key])) {
      for (let [keyv, value] of Object.entries(obj[key])) {
        formData.append(key + "[]", value);
      }
    } else {
      if (typeof obj[key] == "object") {
        formData.append(key, obj[key]);
      } else {
        formData.append(key, obj[key]);
      }
    }
  }
  return formData;
}

export function hrefLink(href_val) {
  return href_val ? href_val : "/";
}

export function doFirstUpperRestLower(word) {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
}

// export function doParseHTML(string) {
//   return parse(string);
// }
export function formatDate(dateString) {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", options);
}

export function eventDateFormat(date) {
  return moment(date).format("DD, MMMM YYYY");
}

export function eventTimeFormat(time) {
  return moment(time, "HHmm").format("hh:mm A");
}

export function eventTimeFormatNew(time) {
  return moment(time, "HHmm").format("hh A");
}

export function onlyDayThreeletters(date) {
  return moment(date).format("ddd");
}

export function onlyDateTwoletters(date) {
  return moment(date).format("DD");
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function nowPlus6Days() {
  let days = [];
  let daysRequired = 7;

  for (let i = 0; i <= daysRequired; i++) {
    days.push(moment().add(i, "days").format("YYYY-MM-DD"));
  }
  return days;
}

export function jobProgressColor(value) {
  switch (value) {
    case "application_in_progress":
    case "online_test_completed":
    case "first_interview_completed":
    case "second_interview_completed":
    case "assessment_day_completed":
      return variables._green_drop;
    case "offer_received":
      return variables._lightgreen_drop;
    case "online_test_failed":
    case "first_interview_failed":
    case "second_interview_failed":
    case "assessment_day_failed":
      return variables._red_drop;
    default:
      return "";
  }
}

export function getActiveClassname(value) {
  switch (value) {
    case 0:
      return "first_active";
    case 1:
      return "second_active";
    case 2:
      return "third_active";
    case 3:
      return "four_active";
    case 4:
      return "five_active";
    default:
      return "";
  }
}

export function makeSalaryString(min, max, interval, currency) {
  min = Number(min);
  max = Number(max);
  if (min === 0 && max === 0) return "Competitive";
  else if (min > 0 && max === 0) return `${currency} ${min} / ${interval}`;
  else if (min > 0 && max > 0)
    return `${currency} ${min} - ${max} / ${interval}`;
  else return "Not Specified";
}

export function priceFormat(num) {
  if (num === null || num === "") return 0;

  const dec = num.split(".")[1];
  const len = dec && dec.length > 2 ? dec.length : 2;
  return Number(num).toFixed(len);
}

export function checkReferralLink(ref) {
  if (
    ref === undefined ||
    ref === "" ||
    ref === null ||
    ref == null ||
    ref === "null" ||
    ref === "null" ||
    ref === "undefined" ||
    ref === false
  ) {
    return false;
  } else {
    return true;
  }
}

export function ambassadorRef() {
  return getCookie("ambassadorRef") ?? "";
}

export function websiteLink(link) {
  const referralLink =
    typeof window !== "undefined" ? window.localStorage.getItem("ref") : "";
  const compaign_name =
    typeof window !== "undefined"
      ? window.localStorage.getItem("compaign_name")
      : "";

  if (checkReferralLink(referralLink))
    return `${link}?ref=${referralLink}&compaign_name=${compaign_name}`;
  else return link;
}

// export function cmsFileUrl(src, folder = "images") {
//   return `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}uploads/${folder}/${src}`;
// }

export function cmsFileUrl(src, folder = "images", stock = false) {
  if (src === null || src === undefined || src === "") {
    if (stock === true) {
      return "/images/stock-profile.jpg";
    } else {
      return "/images/no-image.svg";
    }
  } else {
    return `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}storage/${folder}/${src}`;
  }
}

export function appendSIfPlural(value, string) {
  if (value > 1) {
    return string + "s";
  }
  return string;
}
const project_ap_url = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/`;
const post_headers = {
  accept: "application/json",
};
export async function postData(method, data, parameters = null) {
  let u;
  parameters === null
    ? (u = project_ap_url + method)
    : (u = project_ap_url + method + "/" + parameters);

  return axios
    .post(u, data, {
      headers: post_headers,
    })
    .then((res) => {
      return res.data;
    });
}
export function timeAgo(date) {
  const momentDate = moment(date);
  const diff = moment().diff(momentDate);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) {
    return "Just now";
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diff < month) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diff / year);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
}

export function format_amount(amount) {
  return "$" + amount;
}

// ─── Helper: parse a mileage string like "12,500" → 12500 ────────────────────
export function parseMileage(raw) {
  if (!raw) return null;
  const n = parseInt(String(raw).replace(/,/g, ""), 10);
  return isNaN(n) ? null : n;
}

// ─── Helper: parse a currency string like "4,500.00" → 4500.00 ───────────────
export function parseCurrency(raw) {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

export const makeExternalUrl = (url) => {
  // console.log(url);
  if (url) {
    if (!url.startsWith("https")) {
      url = "https://" + url;
    }
  }

  return url;
};
