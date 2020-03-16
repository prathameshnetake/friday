import {combineReducers} from "redux";
import cities from './city';
import activeCity from './active_city';

export default combineReducers({
  cities,
  activeCity
});
