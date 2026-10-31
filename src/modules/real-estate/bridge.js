/*
 * Bridge for the original BlueMForest page.
 * The page was written as a claude.ai artifact and talks to `window.claude.use(...)`
 * for its shared database ("db"), the viewer ("user") and file saving ("downloads").
 * This shim provides the same interface backed by the dashboard's own API,
 * so the page itself stays unchanged and can still be edited as one HTML file.
 */
(function () {
  var API = "/api/real-estate/ist";
  var listeners = [];
  var cache = [];

  function snapshot() {
    return { docs: cache.map(function (r) { return { id: r.id, data: function () { return r.data; } }; }) };
  }
  function emit() { listeners.forEach(function (l) { try { l.cb(snapshot()); } catch (e) { console.error(e); } }); }
  function fail(err) { listeners.forEach(function (l) { if (l.err) l.err(err); }); }
  function refresh() {
    return fetch(API, { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { if (r.status === 401) { window.top.location.assign("/login?next=/real-estate"); throw new Error("unauthorized"); } if (!r.ok) throw new Error("load " + r.status); return r.json(); })
      .then(function (j) { cache = j.docs || []; emit(); })
      .catch(fail);
  }
  function req(method, id, body) {
    return fetch(API + "/" + encodeURIComponent(id), {
      method: method, credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) {
      if (!r.ok) { var e = new Error("http " + r.status); e.code = r.status === 401 || r.status === 403 ? "permission_denied" : "error"; throw e; }
      return refresh();
    });
  }

  var db = {
    collection: function () {
      return {
        doc: function (id) {
          return {
            set: function (obj) { return req("PUT", id, obj); },
            delete: function () { return req("DELETE", id); },
          };
        },
        onSnapshot: function (cb, err) {
          var l = { cb: cb, err: err };
          listeners.push(l);
          refresh();
          return function () { listeners = listeners.filter(function (x) { return x !== l; }); };
        },
      };
    },
  };

  var ME = { id: null, name: "Felix" };
  var user = {
    id: function () { return Promise.resolve(ME.id); },
    can: function () { return Promise.resolve(true); },
    profiles: function (ids) { var o = {}; (ids || []).forEach(function (i) { o[i] = { name: ME.name }; }); return Promise.resolve(o); },
  };

  var downloads = {
    save: function (opt) {
      var blob = opt.data instanceof Blob ? opt.data : new Blob([opt.data], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = opt.filename || "download";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      return Promise.resolve();
    },
  };

  window.claude = {
    use: function (name) {
      if (name === "db") return Promise.resolve(db);
      if (name === "user") return Promise.resolve(user);
      if (name === "downloads") return Promise.resolve(downloads);
      return Promise.resolve(null);
    },
  };

  // Pick up changes made in another tab or device when the page regains focus.
  window.addEventListener("focus", function () { if (listeners.length) refresh(); });
})();
