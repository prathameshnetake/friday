const ADD_CITY = 'ADD_CITY';

export const defaultCityList = [
  {
    name: "Washington"
  },
  {
    name: "Texas"
  },
  {
    name: "Seattle"
  }
]

export default (state = defaultCityList, action) => {
  switch (action.type) {
    case ADD_CITY:
      return action.cities
    default: 
      return state;
  }
}

export const add_city = (name_or_zip) => (dispatch, state) => {
  const {cities} = state();
  dispatch({
    type: ADD_CITY,
    cities: [...cities, name_or_zip]
  })
}