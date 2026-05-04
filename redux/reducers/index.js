// reducers/index.js
import { combineReducers } from "redux";
import contactReducer from "./contact";
import newsletterReducer from "./newsletter";
const rootReducer = combineReducers({
  contact: contactReducer,
  newsletter: newsletterReducer,
});

export default rootReducer;
