// from https://github.com/remy/polyfills
function cookieStorage (cookieName) {
  function createCookie(name, value, days) {
    var date, expires;
    if (days) {
      date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=",
    ca = document.cookie.split(";"),
    i, c;

    for (i = 0; i < ca.length; i++) {
      c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1, c.length);
      }

      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  function setData(data) {
    data = JSON.stringify(data);
    createCookie(cookieName, data, 365);
  }

  function clearData() {
    createCookie(cookieName, "", 365);
  }

  function getData() {
    var data = readCookie(cookieName);
    return data ? JSON.parse(data) : {};
  }

  // initialise if there's already data
  var data = getData();

  return {
    length: 0,

    clear: function () {
      data = {};
      this.length = 0;
      clearData();
    },

    getItem: function (key) {
      return data[key] === undefined ? null : data[key];
    },

    key: function (i) {
      // not perfect, but works
      var ctr = 0;
      for (var k in data) {
        if (ctr === i) {
          return k;
        } else {
          ctr++;
        }
      }
      return null;
    },

    removeItem: function (key) {
      delete data[key];
      this.length--;
      setData(data);
    },

    setItem: function (key, value) {
      data[key] = value + ""; // forces the value to a string
      this.length++;
      setData(data);
    }
  };
}

function jsonStore(strStore) {
  return {
    getItem: function(key) {
      var str = strStore.getItem(key);
      if(typeof str === "undefined") {
        return undefined;
      }

      if (str === null) {
        return null;
      }

      return JSON.parse(str);
    },

    setItem: function(key, value) {
      if(value === null) {
        return strStore.setItem(key, null);
      } else {
        return strStore.setItem(key, JSON.stringify(value));
      }
    },

    removeItem: function(key) {
      return strStore.removeItem(key);
    },

    clear: function() {
      return strStore.clear();
    }
  };
}


module.exports = exports = jsonStore(window.localStorage || cookieStorage("jtr_session"));
