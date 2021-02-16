import {
    FETCH_UPCOMING_REQUEST,
    FETCH_UPCOMING_SUCCESS,
    FETCH_UPCOMING_FAILURE
  } from './upcomingTypes'
  
  const initialState = {
    loading: false,
    upcoming: [],
    error: ''
  }
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_UPCOMING_REQUEST:
        return {
          ...state,
          loading: true
        }
      case FETCH_UPCOMING_SUCCESS:
        return {
          loading: false,
          upcoming: action.payload,
          error: ''
        }
      case FETCH_UPCOMING_FAILURE:
        return {
          loading: false,
          users: [],
          error: action.payload
        }
      default: return state
    }
  }
  
  export default reducer