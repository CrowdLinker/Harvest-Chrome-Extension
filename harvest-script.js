(() => {
    const b = document.createElement("iframe");
    b.id = "harvest-iframe";
    const f = document.createElement("div");
    f.className = "harvest-overlay";
    f.appendChild(b);
    f.addEventListener("click", _);
    document.addEventListener("keyup", ({
        key: r
    }) => {
        r === "Escape" && _()
    });

    function I(r) {
        b.src = r, document.body.appendChild(f)
    }

    function _() {
        var r;
        (r = f.parentNode) == null || r.removeChild(f)
    }

    function A(r) {
        b.style.height = `${r}px`
    }
    const $ = `.harvest-timer.styled{-webkit-font-smoothing:antialiased;background-image:linear-gradient(#fff,#eee);border:1px solid #bbb;border-radius:2px;color:#222;cursor:pointer;display:inline-block;font:inherit;font-size:0;height:12px;line-height:1;margin:0;padding:3px;position:relative;vertical-align:top;width:12px}.harvest-timer.styled:hover{background-image:linear-gradient(#f8f8f8,#e8e8e8)}.harvest-timer.styled:active{background:#eee;box-shadow:inset 0 1px 4px #0000001a}.harvest-timer.styled:after{background:url("data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='currentColor'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%20aria-label='Clock%20icon'%3e%3ccircle%20cx='12'%20cy='12'%20r='10'%20/%3e%3cpolyline%20points='12%206%2012%2012%2016%2014'%20/%3e%3c/svg%3e") 50% 50% no-repeat;content:"";display:inline-block;font:inherit;height:100%;left:0;margin:0;padding:0;position:absolute;top:0;width:100%}.harvest-timer.styled.running{background-image:linear-gradient(#53b2fc,#1385e5);border-color:#075fa9;color:#fff}.harvest-timer.styled.running:hover{background-image:linear-gradient(#49a4fd,#0e7add)}.harvest-timer.styled.running:active{background:#1385e5;box-shadow:inset 0 1px 5px #0003}#harvest-iframe{background:#fff;border:none;border-radius:6px;box-shadow:0 6px 12px #0003,0 0 0 1px #0000001a;height:300px;left:50%;margin:0 0 0 -250px;overflow:hidden;padding:0;position:absolute;top:0;transition:height .15s;width:500px}@media (min-height: 400px){#harvest-iframe{top:10%}}@media (min-height: 550px){#harvest-iframe{top:20%}}.harvest-overlay{background:#0009;height:100%;left:0;opacity:1;overflow:scroll;position:fixed;top:0;width:100%;z-index:9998}`,
        N = "https",
        T = `${N}://platform.harvestapp.com`;
    let C, y, P, E, k, j, x, L, w, H, g, s;
    document.getElementById("harvest-worker") || (g = document.createElement("iframe"), g.hidden = !0, g.id = "harvest-worker", g.src = `${T}/platform/worker`, document.body.appendChild(g));
    (s = document.getElementById("harvest-messaging")) || (s = document.createElement("div"), s.id = "harvest-messaging", s.hidden = !0, document.body.appendChild(s));
    L = function(r) {
        let e, t;
        return function() {
            let i;
            i = [];
            for (e in r) t = r[e], t != null && i.push(`${e}=${encodeURIComponent(t)}`);
            return i
        }().join("&")
    };
    y = function() {
        return window._harvestPlatformConfig ? window._harvestPlatformConfig : JSON.parse(document.querySelector("script[data-platform-config]").dataset.platformConfig)
    };
    E = function(r) {
        let e, t, i, n, o;
        for (e = {}, o = ["account", "item", "group", "default", "skip-styling"], t = 0, n = o.length; t < n; t++) i = o[t], e[i] = k(r, i);
        return e.group == null && (e.group = k(r, "project")), e.permalink = r.getAttribute("data-permalink"), e
    };
    k = function(r, e) {
        let t;
        return t = function() {
            let i;
            try {
                return JSON.parse((i = r.getAttribute(`data-${e}`)) != null ? i : "null")
            } catch {}
        }(), (t != null ? t.id : void 0) != null && (t.id = "" + t.id), t
    };
    w = function(r) {
        let e, t, i, n, o, a, c, m, p, v;
        for (j = r, c = document.querySelectorAll(".harvest-timer"), v = [], n = 0, a = c.length; n < a; n++) t = c[n], {
            group: i,
            item: o
        } = E(t), r == null || (i != null ? i.id : void 0) !== ((m = r.group) != null ? m.id : void 0) || (o != null ? o.id : void 0) !== ((p = r.item) != null ? p.id : void 0) ? (t.classList.remove("running"), v.push(function() {
            let l, h, d, u;
            for (d = t.children, u = [], l = 0, h = d.length; l < h; l++) e = d[l], u.push(e.classList.remove("running"));
            return u
        }())) : (t.classList.add("running"), v.push(function() {
            let l, h, d, u;
            for (d = t.children, u = [], l = 0, h = d.length; l < h; l++) e = d[l], u.push(e.classList.add("running"));
            return u
        }()));
        return v
    };
    H = function() {
        return w(null)
    };
    P = function(r, e) {
        return r != null && e != null && (e.account != null && (r = r.replace("%ACCOUNT_ID%", e.account.id)), e.group != null && (r = r.replace("%PROJECT_ID%", e.group.id)), e.group != null && (r = r.replace("%GROUP_ID%", e.group.id)), e.item != null && (r = r.replace("%ITEM_ID%", e.item.id))), r
    };
    x = function(r, e) {
        return window.jQuery != null ? window.jQuery(s).bind(r, e) : s.addEventListener(r, e)
    };
    window.addEventListener("message", function(r) {
        if (r.origin !== T || r.data == null) return;
        const {
            type: e,
            value: t
        } = r.data;
        switch (e) {
            case "frame:close":
                return _();
            case "frame:resize":
                return A(t);
            case "timer:started":
                const {
                    id: i, group_id: n
                } = t.external_reference;
                return w({
                    group: {
                        id: n
                    },
                    item: {
                        id: i
                    }
                });
            case "timer:stopped":
                return H()
        }
    });
    C = class {
        constructor({
            stylesheet: e
        }) {
            let t, i;
            this.addTimers = this.addTimers.bind(this), this.findTimers = this.findTimers.bind(this), this.stylesheet = e, i = document.createElement("style"), document.head.appendChild(i), i.appendChild(document.createTextNode(this.stylesheet)), x("harvest-event:timers:add", this.addTimers), x("harvest-event:timers:chrome:add", this.findTimers), this.findTimers(), s.setAttribute("data-ready", !0), t = document.createEvent("CustomEvent"), t.initCustomEvent("harvest-event:ready", !0, !0, {}), (document.body || s).dispatchEvent(t)
        }
        addTimers(e) {
            let t, i, n, o;
            if (t = e.element || ((i = e.originalEvent) != null && (n = i.detail) != null ? n.element : void 0) || ((o = e.detail) != null ? o.element : void 0), (t != null ? t.jquery : void 0) != null && (t = t.get(0)), t) return this.findTimer(t)
        }
        findTimers() {
            let e, t, i, n, o, a;
            for (a = ".harvest-timer:not([data-listening])", t = document.querySelectorAll(a), o = [], i = 0, n = t.length; i < n; i++) e = t[i], o.push(this.findTimer(e));
            return o
        }
        findTimer(e) {
            let t, i;
            return t = e.getAttribute("data-skip-styling"), i = y().skipStyling || e.classList.contains("styled") || t != null && t !== !1 && t !== "false", i || e.classList.add("styled"), e.addEventListener("click", n => (n.stopPropagation(), this.openIframe(E(e)))), w(j), e.setAttribute("data-listening", !0)
        }
        openIframe(e) {
            let t, i, n, o, a, c, m, p;
            return t = {
                app_name: y().applicationName,
                service: e.service || window.location.hostname,
                permalink: e.permalink || P(y().permalink, e),
                external_account_id: (i = e.account) != null ? i.id : void 0,
                external_group_id: (n = e.group) != null ? n.id : void 0,
                external_group_name: (o = e.group) != null ? o.name : void 0,
                external_item_id: (a = e.item) != null ? a.id : void 0,
                external_item_name: (c = e.item) != null ? c.name : void 0,
                default_project_code: (m = e.default) != null ? m.project_code : void 0,
                default_project_name: (p = e.default) != null ? p.project_name : void 0
            }, I(`${T}/platform/timer?${L(t)}`)
        }
    };
    window.postMessage == null ? console.warn(`Harvest Platform is disabled.
To start and stop timers, cross-domain messaging must be supported
by your browser.`) : !window.XMLHttpRequest || !("withCredentials" in new XMLHttpRequest) ? console.warn(`Harvest Platform is disabled.
To check for running timers, xhr requests with credentials must be
supported by your browser.`) : self.HarvestPlatform != null ? self.HarvestPlatform.findTimers() : self.HarvestPlatform = new C({
        stylesheet: $
    });
    //# sourceMappingURL=platform.js.map
})()
