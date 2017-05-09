import { takeEvery }            from 'redux-saga'
import { call, put }            from 'redux-saga/effects'
import * as actions             from '../../actions/cinemas'
import * as Types               from '../../types'
import { orderCinemas }         from '../../selectors'
import firebase                 from 'firebase'


function cinemasPromise() {
  return new Promise(resolve => {
    const database = firebase.database()
    const connectionRef = database.ref('cinemas')
    connectionRef.on('value', resolve)
  })
}

function replaceOriginalWidth(cinemas) {
	cinemas.map(cinema => {
		cinema.movies.map(movie => {
		  movie.backdropImage = movie.backdropImage.replace('original', 'w780')
    })
	})

  return cinemas
}

function tabsName(cinemas) {
  return cinemas.map(cinema => ({
    name: cinema.name,
    id: cinema.id
  }))
}

function* fetchCinemas() {
    try {
      const cinemas = yield call(cinemasPromise)
      const cinemasOrdened = orderCinemas(cinemas.val())

      yield put( actions.cinemasReceived( replaceOriginalWidth( cinemasOrdened ) ) )
      yield put( actions.selectCinema(0) )
      yield put( actions.saveTabs( tabsName( cinemasOrdened ) ) )
    }
    catch (error) {
        yield put(actions.fetchCinemasFailed(error))
    }
}

function* watchFetchCinemas() {
    yield* takeEvery(Types.FETCH_CINEMAS, fetchCinemas)
}

export default watchFetchCinemas