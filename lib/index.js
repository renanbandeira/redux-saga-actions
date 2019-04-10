'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handlePromiseSaga = exports.formActionSaga = exports.createFormAction = exports.PROMISE = exports.PROMISE_ACTION = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createAction = createAction;
exports.handleActionSaga = handleActionSaga;
exports.actionsWatcherSaga = actionsWatcherSaga;

var _effects = require('redux-saga/effects');

var _marked = [handleActionSaga, actionsWatcherSaga].map(regeneratorRuntime.mark);

var PROMISE_ACTION = exports.PROMISE_ACTION = '@@redux-saga-actions/PROMISE';

var identity = function identity(i) {
  return i;
};

var REQUEST = 'REQUEST';
var SUCCESS = 'SUCCESS';
var FAILURE = 'FAILURE';

var statuses = [REQUEST, SUCCESS, FAILURE];

function createAction(requestAction, types) {
  var payloadCreator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : identity;

  var actionMethods = {};
  var action = function action(payload) {
    return {
      type: PROMISE_ACTION,
      payload: payload
    };
  };

  // Allow a type prefix to be passed in
  if (typeof requestAction === 'string') {
    requestAction = statuses.map(function (status) {
      var actionType = requestAction + '_' + status;
      var subAction = function subAction(payload) {
        return {
          type: actionType,
          payload: payloadCreator(payload)
        };
      };

      // translate specific actionType to generic actionType
      actionMethods[status] = actionType;
      actionMethods[status.toLowerCase()] = subAction;

      return subAction;
    })[0];

    if (types) {
      payloadCreator = types;
    }

    types = [actionMethods[SUCCESS], actionMethods[FAILURE]];
  }

  if (types.length !== 2) {
    throw new Error('Must include two action types: [ SUCCESS, FAILURE ]');
  }

  return Object.assign(function (data, dispatch) {
    return new Promise(function (resolve, reject) {
      dispatch(action({
        types: types,
        request: requestAction(data),
        defer: { resolve: resolve, reject: reject }
      }));
    });
  }, actionMethods);
}

function handleActionSaga(_ref) {
  var payload = _ref.payload;

  var request, defer, types, resolve, reject, _types, SUCCESS, FAILURE, _ref2, _ref3, _ref3$, success, failure;

  return regeneratorRuntime.wrap(function handleActionSaga$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          request = payload.request, defer = payload.defer, types = payload.types;
          resolve = defer.resolve, reject = defer.reject;
          _types = _slicedToArray(types, 2), SUCCESS = _types[0], FAILURE = _types[1];
          _context.next = 5;
          return (0, _effects.all)([(0, _effects.race)({
            success: (0, _effects.take)(SUCCESS),
            failure: (0, _effects.take)(FAILURE)
          }), (0, _effects.put)(request)]);

        case 5:
          _ref2 = _context.sent;
          _ref3 = _slicedToArray(_ref2, 1);
          _ref3$ = _ref3[0];
          success = _ref3$.success;
          failure = _ref3$.failure;

          if (!success) {
            _context.next = 15;
            break;
          }

          _context.next = 13;
          return (0, _effects.call)(resolve);

        case 13:
          _context.next = 17;
          break;

        case 15:
          _context.next = 17;
          return (0, _effects.call)(reject, failure && failure.payload ? failure.payload : failure);

        case 17:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function actionsWatcherSaga() {
  return regeneratorRuntime.wrap(function actionsWatcherSaga$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _effects.takeEvery)(PROMISE_ACTION, handleActionSaga);

        case 2:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

exports.default = actionsWatcherSaga;

// add backward compatibility with redux-form-saga >=0.0.7:

var PROMISE = exports.PROMISE = PROMISE_ACTION;
var createFormAction = exports.createFormAction = createAction;
var formActionSaga = exports.formActionSaga = actionsWatcherSaga;
var handlePromiseSaga = exports.handlePromiseSaga = handleActionSaga;