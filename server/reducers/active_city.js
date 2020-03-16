const MAKE_ACTIVE_CITY = 'MAKE_ACTIVE_CITY';
import {defaultCityList} from './city'

const defaultActiveCity = defaultCityList[0]; // make first city active

export default (state = defaultActiveCity, action) => {
  switch (action.type) {
    case MAKE_ACTIVE_CITY:
      return action.activeCity
    default: 
      return state;
  }
}

export const change_active_city = (name_or_zip) => (dispatch, state) => {
  dispatch({
    type: MAKE_ACTIVE_CITY,
    activeCity: name_or_zip
  })
}