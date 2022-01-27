import axios from 'axios'
import { getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import moment from 'moment';
import {
  FETCH_PAYLOADS_REQUEST,
  FETCH_PAYLOADS_SUCCESS,
  FETCH_PAYLOADS_FAILURE
} from './payloadTypes'

export const fetchPayloads = () => {
  const database = getFirestore();
  const auth = getAuth(getApp())

    return async (dispatch) => {
      dispatch(fetchPayloadsRequest())

      signInAnonymously(auth).then(async () => {
      
      const docRef = doc(database, "apidata", "payloads");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data()
        const diff = moment().diff(moment(data!['last_updated']), "seconds");
        // 5 minutes, Get new data if existing data is old
        if (diff > 300) {
          axios
            .get('https://api.spacexdata.com/v4/payloads')
            .then(async response => {
              const payloads = response.data
              payloads['last_updated'] = moment().toString();
              await setDoc(docRef, Object.assign({}, payloads), { merge: true });
              dispatch(fetchPayloadsSuccess(payloads, payloads['last_updated']))
            })
            .catch(error => {
              dispatch(fetchPayloadsFailure(error.message))
            })
        } else {
          let data1 = [] as any;
          for (let i in data) {
            if (i !== "last_updated") {
              data1[i] = { ...data1[i], ...data[i] }
            }
          }
          dispatch(fetchPayloadsSuccess(data1, data!['last_updated']))
        }
      }
  })
    .catch((error) => {
      console.log(error.code, error.message)
    })}
}

export const fetchPayloadsRequest = () => {
  return {
    type: FETCH_PAYLOADS_REQUEST
  }
}

export const fetchPayloadsSuccess = (payloads, lastUpdate) => {
  return {
    type: FETCH_PAYLOADS_SUCCESS,
    payloads: payloads,
    lastUpdated: lastUpdate
  }
}

export const fetchPayloadsFailure = error => {
  return {
    type: FETCH_PAYLOADS_FAILURE,
    payloads: error
  }
}