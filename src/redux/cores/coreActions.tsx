import axios from 'axios'
import { getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';

import moment from 'moment';
import {
  FETCH_CORES_REQUEST,
  FETCH_CORES_SUCCESS,
  FETCH_CORES_FAILURE
} from './coreTypes'

export const fetchCores = () => {
  const database = getFirestore();
  const auth = getAuth(getApp())
 
    return async (dispatch) => {
      dispatch(fetchCoresRequest())
      signInAnonymously(auth).then(async () => {
     

      const docRef = doc(database, "apidata", "cores");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data()
        const diff = moment().diff(moment(data!['last_updated']), "seconds");
        // 5 minutes, Get new data if existing data is old
        if (diff > 300) {
          axios
            .get('https://api.spacexdata.com/v4/cores')
            .then(async response => {
              const cores = response.data
              cores['last_updated'] = moment().toString();
              await setDoc(docRef, Object.assign({}, cores), { merge: true });
              dispatch(fetchCoresSuccess(cores, cores['last_updated']))
            })
            .catch(error => {
              dispatch(fetchCoresFailure(error.message))
            })
        } else {
          let data1 = [] as any;
          for (let i in data) {
            if (i !== "last_updated") {
              data1[i] = { ...data1[i], ...data[i] }
            }
          }
          dispatch(fetchCoresSuccess(data1, data!['last_updated']))
        }
      }

  })
    .catch((error) => {
      console.log(error.code, error.message)
    })}

}

export const fetchCoresRequest = () => {
  return {
    type: FETCH_CORES_REQUEST
  }
}

export const fetchCoresSuccess = (cores, lastUpdate) => {
  return {
    type: FETCH_CORES_SUCCESS,
    payload: cores,
    lastUpdated: lastUpdate
  }
}

export const fetchCoresFailure = error => {
  return {
    type: FETCH_CORES_FAILURE,
    payload: error
  }
}