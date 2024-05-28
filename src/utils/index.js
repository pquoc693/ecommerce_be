"use strict";

const _ = require("lodash");
const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

// [a, b, c] => {a: 1, b: 1, c: 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 1]));
};
// [a, b, c] => {a: 0, b: 0, c: 0}
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((item) => [item, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  });

  return obj;
};

/*
    const a = {
        a: 1,
        b: {
            c: 2,
            d: 3
        }
    }
    =>
    const b = {
        a: 1,
        b.c: 2,
        b.d: 3
    }
*/

const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const nested = updateNestedObjectParser(obj[k]);
      Object.keys(nested).forEach((nk) => {
        final[`${k}.${nk}`] = nested[nk];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser
};
