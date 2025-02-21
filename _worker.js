import * as t from 'bcryptjs';
import { GenerateToken as e, Delay as s } from "./helpers";
import { version as r } from "./variables";
export async function GetLogin(t, e) {
    let s = new URL(t.url), o = "";
    return "error" == s.searchParams.get("message") && (o = `<div class="p-3 bg-danger text-white fw-bold text-center">Invalid password / کلمه عبور معتبر نمی‌باشد!</div>`), new Response(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf8" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    </head>
    <body dir="ltr">
      <div class="container border p-0">
        <div class="p-3 bg-primary text-white">
          <div class="text-nowrap fs-4 fw-bold text-center">V2RAY Worker - Control Panel</div>
          <div class="text-nowrap fs-6 text-center">
            Version ${r}
          </div>
        </div>
        ${o}
        <form class="mt-5 p-3 row g-3" method="post">
          <div class="col-auto">
            Enter password / کلمه‌ی عبور را وارد کنید:
          </div>
          <div class="col-auto">
            <label for="inputPassword2" class="visually-hidden">Password</label>
            <input type="password" class="form-control" id="inputPassword2" placeholder="Password" name="password" minlength="6" required>
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary mb-3">Confirm identity / تایید هویت</button>
          </div>
        </form>
      </div>
    </body>
  </html>
  `, {
        headers: {
            "Content-Type": "text/html"
        }
    });
}
export async function PostLogin(r, o) {
    let a = new URL(r.url), i = (await r.formData()).get("password") || "", n = await o.settings.get("Password") || "";
    if (await s(1000), await t.compare(i, n)) {
        let t = e(24);
        return await o.settings.put("Token", t), Response.redirect(`${a.protocol}//${a.hostname}${"443" != a.port ? ":" + a.port : ""}/?token=${t}`, 302);
    }
    return Response.redirect(`${a.protocol}//${a.hostname}${"443" != a.port ? ":" + a.port : ""}/login?message=error`, 302);
}

import e from 'js-yaml';
import { defaultClashConfig as l } from "./variables";
export function ToYamlSubscription(r) {
    l.proxies = r.map((e)=>(({ merged: e, ...l })=>l)(e));
    let t = r.reduce((e, l)=>(e[l?.merged ? 'Worker' : 'Original'] || (e[l?.merged ? 'Worker' : 'Original'] = []), e[l?.merged ? 'Worker' : 'Original'].push(l), e), {}), a = [];
    for(let e in t)a[e] = t[e];
    let o = [
        {
            name: "All",
            type: "select",
            proxies: [
                "All - UrlTest",
                "All - Fallback",
                "All - LoadBalance(ch)",
                "All - LoadBalance(rr)"
            ].concat(Object.keys(a))
        },
        {
            name: "All - UrlTest",
            type: "url-test",
            url: "http://clients3.google.com/generate_204",
            interval: 600,
            proxies: Object.keys(a)
        },
        {
            name: "All - Fallback",
            type: "fallback",
            url: "http://clients3.google.com/generate_204",
            interval: 600,
            proxies: Object.keys(a)
        },
        {
            name: "All - LoadBalance(ch)",
            type: "load-balance",
            strategy: "consistent-hashing",
            url: "http://clients3.google.com/generate_204",
            interval: 600,
            proxies: Object.keys(a)
        },
        {
            name: "All - LoadBalance(rr)",
            type: "load-balance",
            strategy: "round-robin",
            url: "http://clients3.google.com/generate_204",
            interval: 600,
            proxies: Object.keys(a)
        }
    ];
    for(let e in a)o.push({
        name: e,
        type: "url-test",
        url: "http://clients3.google.com/generate_204",
        interval: 600,
        proxies: a[e]
    });
    return l['proxy-groups'] = o, e.dump(l);
}

import t from 'js-yaml';
import { Buffer as e } from 'buffer';
import { GetVlessConfigList as n } from './vless';
import { GetTrojanConfigList as i } from './trojan';
import { MixConfig as l, ValidateConfig as o, DecodeConfig as s } from "./config";
import { GetMultipleRandomElements as a, RemoveDuplicateConfigs as r, AddNumberToConfigs as g, IsBase64 as f, MuddleDomain as c } from "./helpers";
import { version as h, providersUri as m, defaultProtocols as u, defaultALPNList as p, defaultPFList as d, fragmentsLengthList as w, fragmentsIntervalList as M } from "./variables";
export async function GetConfigList(y, C) {
    let b = 200, v = [], j = [], x = [], P = [], I = !0, k = !0, $ = [], E = [], F = !0, L = !1;
    try {
        b = parseInt(await C.settings.get("MaxConfigs") || "200"), (await C.settings.get("Version") || "2.0") == h && (v = await C.settings.get("Protocols").then((t)=>t ? t.split("\n") : []));
        let t = await C.settings.get("BlockPorn") == "yes", e = (await C.settings.get("Countries") || "").trim().length > 0;
        t ? (v = [
            "built-in-vless"
        ], b = 20) : e && (v = [
            "built-in-vless",
            "built-in-trojan"
        ], b = 40), j = (await C.settings.get("Providers"))?.split("\n").filter((t)=>t.trim().length > 0) || [], x = (await C.settings.get("ALPNs"))?.split("\n").filter((t)=>t.trim().length > 0) || [], P = (await C.settings.get("FingerPrints"))?.split("\n").filter((t)=>t.trim().length > 0) || [], I = "yes" == (await C.settings.get("IncludeOriginalConfigs") || "yes"), k = "yes" == (await C.settings.get("IncludeMergedConfigs") || "yes") && (v.includes("vmess") || v.includes("vless")), $ = (await C.settings.get("CleanDomainIPs"))?.split("\n").filter((t)=>t.trim().length > 0) || [], F = await C.settings.get("MaxConfigs") === null, E = (await C.settings.get("Configs"))?.split("\n").filter((t)=>t.trim().length > 0) || [], L = await C.settings.get("EnableFragments") == "yes";
    } catch  {}
    v = v.length ? v : u, x = x.length ? x : p, P = P.length ? P : d, $ = $.length ? $ : [
        c(y.hostname)
    ], v.includes("built-in-vless") && (b -= 20), v.includes("built-in-trojan") && (b -= 20), F && (I = !0, k = !0), j.length || (j = await fetch(m).then((t)=>t.text()).then((t)=>t.trim().split("\n").filter((t)=>t.trim().length > 0))), I && k && (b = Math.floor(b / 2));
    let O = [], A = [], B = [], D = [], G = Math.floor(b / Object.keys(j).length);
    for (let n of j)try {
        var N = await fetch(n).then((t)=>t.text());
        try {
            if (!(D = t.load(N).proxies).length) throw "no-yaml";
            D = D.filter((t)=>v.includes(t.type)).filter(o);
        } catch (t) {
            f(N) && (N = e.from(N, "base64").toString("utf-8")), (D = N.split("\n").filter((t)=>t.match(RegExp(`^(${v.join("|")}):\/\/`, "i")))).length && (D = D.map(s).filter(o));
        }
        k && A.push({
            url: n,
            count: G,
            configs: D.filter((t)=>[
                    "vmess",
                    "vless"
                ].includes(t.configType)),
            mergedConfigs: null
        }), I && O.push({
            url: n,
            count: G,
            configs: D
        });
    } catch (t) {}
    $.length || ($ = [
        c(y.hostname)
    ]);
    let R = $[Math.floor(Math.random() * $.length)];
    for(let t in A){
        let e = A[t];
        A[t].mergedConfigs = e.configs.map((t)=>l(t, y, R, e.name)).filter((t)=>t?.merged && t?.remarks);
    }
    let S = 0;
    for(let t = 0; t < 5; t++)for (let t of A)t.count > t.mergedConfigs.length ? (S = S + t.count - t.mergedConfigs.length, t.count = t.mergedConfigs.length) : t.count < t.mergedConfigs.length && S > 0 && (t.count = t.count + Math.ceil(S / 3), S -= Math.ceil(S / 3));
    for (let t of A)B = B.concat(a(t.mergedConfigs, t.count));
    if (I) {
        let t = 0;
        for(let e = 0; e < 5; e++)for (let e of O)e.count > e.configs.length ? (t = t + e.count - e.configs.length, e.count = e.configs.length) : e.count < e.configs.length && t > 0 && (e.count = e.count + Math.ceil(t / 3), t -= Math.ceil(t / 3));
        for (let t of O)B = B.concat(a(t.configs, t.count));
    }
    E.length && (B = B.concat(E.map(s))), B = r(B.filter(o));
    let T = [], V = [], q = 1;
    return v.includes("built-in-vless") && (T = await n(y.hostname, $, q, 20, C), q += 20), v.includes("built-in-trojan") && (V = await i(y.hostname, $, q, 20, C), q += 20), console.log(B = (B = T.concat(V).concat(g(B, q))).map((t)=>(t.fp = P[Math.floor(Math.random() * P.length)], t.alpn = x[Math.floor(Math.random() * x.length)], L && "tls" == t.tls && (t.fragment = `tlshello,${w[Math.floor(Math.random() * w.length)]},${M[Math.floor(Math.random() * M.length)]}`), t))), B;
}

import { Buffer as e } from 'buffer';
import { IsIp as t, IsValidUUID as r, MuddleDomain as s } from "./helpers";
import { cfPorts as o } from "./variables";
export function MixConfig(e, r, n, a) {
    let p = s(r.hostname);
    try {
        let r = {
            ...e
        };
        if ([
            "ws",
            "h2",
            "http"
        ].includes(r.network)) {
            if (!o.includes(r.port)) throw Error("Port is not matched!");
        } else throw Error("Network is not supported!");
        let s = r.sni || r.host || r.address;
        if (t(s)) throw Error("Invalid SNI!");
        if (s.toLocaleLowerCase().endsWith('.workers.dev') || s.toLocaleLowerCase().endsWith('.pages.dev')) throw Error("Config is running on Cloudflare, Skipped!");
        r.remarks = r.remarks + "-worker";
        let a = r.path;
        return r.host = p, r.sni = p, r.address = n, r.path = `/${s}:${r.port}/${a.replace(/^\//g, "")}`, r.merged = !0, r;
    } catch (e) {
        return null;
    }
}
export function EncodeConfig(t) {
    try {
        if ("vmess" == t.configType) {
            let r = {
                type: t.type,
                ps: t.remarks,
                add: t.address,
                port: t.port,
                id: t.uuid,
                aid: t.alterId || 0,
                tls: t.tls,
                sni: t.sni,
                net: t.network,
                path: t.path,
                host: t.host,
                alpn: t.alpn,
                fp: t.fp
            };
            return `vmess://${e.from(JSON.stringify(r), "utf-8").toString("base64")}`;
        }
        if ("vless" == t.configType) return `vless://${t.uuid}@${t.address}:${t.port}?encryption=${encodeURIComponent(t.encryption || "none")}&type=${t.network}${t.path ? "&path=" + encodeURIComponent(t.path) : ""}${t.host ? "&host=" + encodeURIComponent(t.host) : ""}${t.security ? "&security=" + encodeURIComponent(t.security) : ""}${t.flow ? "&flow=" + encodeURIComponent(t.flow) : ""}${t.pbk ? "&pbk=" + encodeURIComponent(t.pbk) : ""}${t.sid ? "&sid=" + encodeURIComponent(t.sid) : ""}${t.spx ? "&spx=" + encodeURIComponent(t.spx) : ""}${t.seed ? "&seed=" + encodeURIComponent(t.seed) : ""}${t.quicSecurity ? "&quicSecurity=" + encodeURIComponent(t.quicSecurity) : ""}${t.key ? "&key=" + encodeURIComponent(t.key) : ""}${t.mode ? "&mode=" + encodeURIComponent(t.mode) : ""}${t.authority ? "&authority=" + encodeURIComponent(t.authority) : ""}${t.headerType ? "&headerType=" + encodeURIComponent(t.headerType) : ""}${t.alpn ? "&alpn=" + encodeURIComponent(t.alpn) : ""}${t.fp ? "&fp=" + encodeURIComponent(t.fp) : ""}${t.fragment ? "&fragment=" + encodeURIComponent(t.fragment) : ""}&sni=${encodeURIComponent(t.sni || t.host || t.address)}#${encodeURIComponent(t.remarks)}`;
        if ("trojan" == t.configType) return `${t.configType}://${t.password || t.uuid}@${t.address}:${t.port}?type=${t.network}${t.cipher ? "&cipher=" + encodeURIComponent(t.cipher) : ""}${t.path ? "&path=" + t.path : ""}${t.host ? "&host=" + t.host : ""}${t.alpn ? "&alpn=" + encodeURIComponent(t.alpn) : ""}${t.fp ? "&fp=" + encodeURIComponent(t.fp) : ""}${t.tls ? "&tls=1" : ""}&sni=${encodeURIComponent(t.sni || t.host || t.address)}#${encodeURIComponent(t.remarks)}`;
    } catch (e) {}
    return "";
}
export function DecodeConfig(t) {
    let r = null;
    if (t.startsWith("vmess://")) try {
        r = JSON.parse(e.from(t.substring(8), "base64").toString("utf-8"));
        let s = r?.type || "";
        r = {
            configType: "vmess",
            remarks: r?.ps,
            address: r.add,
            port: parseInt(r.port),
            uuid: r.id,
            alterId: r?.aid || 0,
            security: r?.scy || "auto",
            network: r.net,
            type: s == r.net ? "" : s,
            host: r?.host,
            path: r?.path || "",
            tls: r?.tls || "",
            sni: r?.sni || r?.host
        };
    } catch (e) {}
    else if (t.startsWith("vless://")) try {
        let e = new URL(t);
        r = {
            configType: "vless",
            remarks: decodeURIComponent(e.hash.substring(1)),
            address: e.hostname,
            port: parseInt(e.port || ("tls" == e.searchParams.get('tls') ? "443" : "80")),
            uuid: e.username,
            security: e.searchParams.get('security') || "",
            encryption: e.searchParams.get('encryption') || "none",
            type: e.searchParams.get('type') || "tcp",
            serviceName: e.searchParams.get('serviceName') || "",
            host: e.searchParams.get('host') || "",
            path: e.searchParams.get('path') || "",
            tls: "tls" == e.searchParams.get('security') ? "tls" : "",
            sni: e.searchParams.get('sni') || "",
            flow: e.searchParams.get('flow') || "",
            pbk: e.searchParams.get('pbk') || "",
            sid: e.searchParams.get('sid') || "",
            spx: e.searchParams.get('spx') || "",
            headerType: e.searchParams.get('headerType') || "",
            seed: e.searchParams.get('seed') || "",
            quicSecurity: e.searchParams.get('quicSecurity') || "",
            key: e.searchParams.get('key') || "",
            mode: e.searchParams.get('mode') || "",
            authority: e.searchParams.get('authority') || ""
        };
    } catch (e) {}
    return r;
}
export function ValidateConfig(e) {
    try {
        if ([
            "vmess",
            "vless"
        ].includes(e.configType) && r(e.uuid) && e.remarks || [
            "trojan"
        ].includes(e.configType) && (e.uuid || e.password) && e.remarks) return !!(e.address || e.sni);
    } catch (e) {}
    return !1;
}

import t from 'crypto-js/sha224';
import e from 'crypto-js/enc-hex';
import { v5 as r } from "uuid";
import { providersUri as o, proxiesUri as n } from "./variables";
export function GetMultipleRandomElements(t, e) {
    return t.sort(()=>0.5 - Math.random()).slice(0, e);
}
export function IsIp(t) {
    try {
        if ("" == t || void 0 == t || !/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(t)) return !1;
        let e = t.split('.');
        if (null == e || 4 != e.length || "0" == e[3] || 0 === parseInt(e[3])) return !1;
        return !0;
    } catch (t) {}
    return !1;
}
export function IsValidUUID(t) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t);
}
export function GetVlessConfig(t, e, r, o, n) {
    return o.toLowerCase() == r.toLowerCase() && (o = r), {
        remarks: `${t}-vless-worker-${o}`,
        configType: "vless",
        security: "tls",
        tls: "tls",
        network: "ws",
        port: n,
        sni: r,
        uuid: e,
        host: r,
        path: "vless-ws/?ed=2048",
        address: o
    };
}
export function GetTrojanConfig(t, e, r, o, n) {
    return o.toLowerCase() == r.toLowerCase() && (o = r), {
        remarks: `${t}-trojan-worker-${o}`,
        configType: "trojan",
        security: "tls",
        tls: "tls",
        network: "ws",
        port: n,
        sni: r,
        password: e,
        host: r,
        path: "trojan-ws/?ed=2048",
        address: o
    };
}
export function IsBase64(t) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(t);
}
export function RemoveDuplicateConfigs(t) {
    let e = {};
    return t.filter((t)=>{
        let r = t.remarks + t.port + t.address + t.uuid;
        return !e[r] && (e[r] = !0, !0);
    });
}
export function AddNumberToConfigs(t, e) {
    return t.map((t, r)=>(t.remarks = r + e + "-" + t.remarks, t));
}
export function GenerateToken(t = 32) {
    let e = new Uint8Array(t);
    for(let r = 0; r < t; r++)e[r] = Math.floor(256 * Math.random());
    return Array.from(e).map((t)=>t.toString(16).padStart(2, '0')).join('');
}
export function Delay(t) {
    return new Promise((e)=>setTimeout(e, t));
}
export function MuddleDomain(t) {
    let e = t.split(".");
    return e.slice(0, e.length - 2).join(".") + "." + e.slice(-2).join(".").split("").map((t)=>0.5 > Math.random() ? t.toLowerCase() : t.toUpperCase()).join("");
}
export async function getDefaultProviders() {
    return fetch(o).then((t)=>t.text()).then((t)=>t.trim().split("\n"));
}
export async function getDefaultProxies() {
    return fetch(n).then((t)=>t.text()).then((t)=>t.trim().split("\n").filter((t)=>t.trim().length > 0));
}
export async function getProxies(t) {
    let e = [];
    try {
        e = (await t.settings.get("Proxies"))?.trim().split("\n").filter((t)=>t.trim().length > 0) || [];
    } catch (t) {}
    return e.length || (e = await getDefaultProxies()), e;
}
export function getUUID(t) {
    return r(t.toLowerCase(), "ebc4a168-a6fe-47ce-bc25-6183c6212dcc");
}
export function getSHA224Password(r) {
    return t(r.toLowerCase()).toString(e);
}

export { };

import * as e from 'bcryptjs';
import { GenerateToken as t } from "./helpers";
import { version as s, defaultProtocols as n, proxiesUri as i } from "./variables";
export async function GetPanel(e, t) {
    let l = new URL(e.url);
    try {
        let e = await t.settings.get("Password"), a = await t.settings.get("Token");
        if (e && l.searchParams.get("token") != a) return Response.redirect(`${l.origin}/login`, 302);
        (await t.settings.get("Version") || "2.0") != s && (await t.settings.delete("Providers"), await t.settings.delete("Protocols"));
        let o = parseInt(await t.settings.get("MaxConfigs") || "200"), r = (await t.settings.get("Protocols"))?.split("\n").filter((e)=>e.trim().length > 0) || n, c = (await t.settings.get("ALPNs"))?.split("\n").filter((e)=>e.trim().length > 0) || [], d = (await t.settings.get("FingerPrints"))?.split("\n").filter((e)=>e.trim().length > 0) || [], p = (await t.settings.get("CleanDomainIPs"))?.split("\n").filter((e)=>e.trim().length > 0) || [], m = (await t.settings.get("Configs"))?.split("\n").filter((e)=>e.trim().length > 0) || [], g = await t.settings.get("IncludeOriginalConfigs") || "yes", u = await t.settings.get("IncludeMergedConfigs") || "yes", b = await t.settings.get("EnableFragments") || "no", f = await t.settings.get("BlockPorn") || "no", v = (await t.settings.get("Providers"))?.split("\n").filter((e)=>e.trim().length > 0) || [], h = (await t.settings.get("Countries"))?.split(",").filter((e)=>e.trim().length > 0) || [], y = await fetch(i).then((e)=>e.text()).then((e)=>e.trim().split("\n").map((e)=>{
                let t = e.split(",");
                return t.length > 0 ? t[1]?.toString().trim().toUpperCase() : "";
            }).filter((e)=>e));
        y = [
            ...new Set(y)
        ].sort();
        let k = "", w = l.searchParams.get("message");
        "success" == w ? k = `<div class="p-1 bg-success text-white fw-bold text-center">Settings saved successfully.<br/>تنظیمات با موفقیت ذخیره شد.</div>` : "error" == w && (k = `<div class="p-1 bg-danger text-white fw-bold text-center">Failed to save settings!<br/>خطا در ذخیره‌ی تنظیمات!</div>`);
        let x = "";
        x = e ? `
      <div class="mb-3 p-1">
        <button type="submit" name="reset_password" value="1" class="btn btn-danger">Remove Password / حذف کلمه عبور</button>
      </div>
      ` : `
      <div class="mb-1 p-1 pb-0 pt-3 mt-3 border-top border-primary border-4">
        <label for="configs" class="form-label fw-bold"> Security&nbsp;</label>
      </div>
      <div class="mb-3 p-3 border rounded">
        <label for="password" class="form-label fw-bold">
          Enter password, if you want to protect panel / در صورتی که میخواهید از پنل محافظت کنید، یک کلمه‌ی عبور وارد کنید:
        </label>
        <input type="password" name="password" class="form-control" id="password" minlength="6"/>
        <div class="form-text">
          Minimum 6 chars / حداقل ۶ کاراکتر وارد کنید.
        </div>
        <p></p>
        <label for="password-confirmation" class="form-label fw-bold">
          Confirm your password / کلمه عبور را مجددا وارد کنید:
        </label>
        <input type="password" name="password_confirmation" class="form-control" id="password-confirmation" minlength="6"/>
      </div>
      `;
        let E = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf8" />
      <link rel="shortcut icon" type="image/ico" href="https://dash.cloudflare.com/favicon.ico" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
      <script>
        let language = localStorage.getItem("lang") || "fa"
        window.addEventListener("load", (event) => {
          initLang();
          setLang(language);

          document.getElementById('providers-check').addEventListener("change", () => {
            if (document.getElementById('providers-check').checked) {
              document.getElementById('providers').style.display = ""
              document.getElementById('providers-remarks').style.display = ""
              document.getElementById('providers-auto-title').style.display = "none"
            } else {
              document.getElementById('providers').style.display = "none"
              document.getElementById('providers-remarks').style.display = "none"
              document.getElementById('providers-auto-title').style.display = ""
            }
          });
          document.getElementById('providers-check').dispatchEvent(new Event("change"));

          document.getElementById('countries-check').addEventListener("change", () => {
            if (document.getElementById('countries-check').checked) {
              document.getElementById('countries-div').style.display = ""
            } else {
              document.getElementById('countries-div').style.display = "none"
            }
          });
          document.getElementById('countries-check').dispatchEvent(new Event("change"));

          document.getElementById('clean-ips-check').addEventListener("change", () => {
            if (document.getElementById('clean-ips-check').checked) {
              document.getElementById('clean-ips').style.display = ""
              document.getElementById('clean-ips-remarks').style.display = ""
            } else {
              document.getElementById('clean-ips').style.display = "none"
              document.getElementById('clean-ips-remarks').style.display = "none"
            }
          });
          document.getElementById('clean-ips-check').dispatchEvent(new Event("change"));

          document.getElementById('configs-check').addEventListener("change", () => {
            if (document.getElementById('configs-check').checked) {
              document.getElementById('configs').style.display = ""
              document.getElementById('personal-configs-remarks').style.display = ""
            } else {
              document.getElementById('configs').style.display = "none"
              document.getElementById('personal-configs-remarks').style.display = "none"
            }
          });
          document.getElementById('configs-check').dispatchEvent(new Event("change"));

          document.getElementById('fp-list-check').addEventListener("change", () => {
            if (document.getElementById('fp-list-check').checked) {
              document.getElementById('fp-list').style.display = ""
              document.getElementById('fp-list-remarks').style.display = ""
            } else {
              document.getElementById('fp-list').style.display = "none"
              document.getElementById('fp-list-remarks').style.display = "none"
            }
          });
          document.getElementById('fp-list-check').dispatchEvent(new Event("change"));

          document.getElementById('alpn-list-check').addEventListener("change", () => {
            if (document.getElementById('alpn-list-check').checked) {
              document.getElementById('alpn-list').style.display = ""
              document.getElementById('alpn-list-remarks').style.display = ""
            } else {
              document.getElementById('alpn-list').style.display = "none"
              document.getElementById('alpn-list-remarks').style.display = "none"
            }
          });
          document.getElementById('alpn-list-check').dispatchEvent(new Event("change"));
        });
        window.addEventListener('message', function (event) {
          if (event.data?.cleanIPs) {
            document.getElementById('clean-ips').value = event.data.cleanIPs;
          }
        });
    
        function initLang() {
          document.getElementById("lang-group").innerHTML = ""
          for (code in strings) {
            const el = document.createElement("button")
            el.classList = "btn btn-outline-primary btn-sm rounded-2"
            el.id = \`btn-\${code}\`
            el.type = "button"
            el.innerText = code.toUpperCase()
            el.setAttribute("data-lang", code);
            el.addEventListener("click", (e) => {
                setLang(e.srcElement.getAttribute("data-lang"))
            })
            document.getElementById("lang-group").appendChild(el)
    
            const el2 = document.createElement("span")
            el2.innerHTML = "&nbsp;"
            document.getElementById("lang-group").appendChild(el2)
          }
        }
      
        function setLang(code) {
          if (strings[code] === undefined) {
            code = "en"
          }
          
          document.getElementById('body').style.direction = languages[code]?.dir || "ltr"
          document.getElementById('lang-group').style.float = languages[code]?.end || "left"
          document.getElementById('btn-' + language).classList.remove('btn-primary')
          document.getElementById('btn-' + language).classList.add('btn-outline-primary')
          document.getElementById('btn-' + code).classList.remove('btn-outline-primary')
          document.getElementById('btn-' + code).classList.add('btn-primary')
          
          for (key in strings[code]) {
            document.getElementById(key).innerText = strings[code][key]
          }
      
          language = code
          localStorage.setItem('lang', code);
        }
    
        const languages = {
          en: {dir: "ltr", end: "right"},
          fa: {dir: "rtl", end: "left"},
        }
      
        const strings = {
          en: {
            "page-title": "V2ray Worker Control Panel",
            "text-version": "Version",
            "sub-link-title": "Your subscription link for v2ray clients (v2rayN, v2rayNG, v2rayA, Nekobox, Nekoray, V2Box...)",
            // "custom-link-title": "Your subscription link for custom configs",
            "clash-link-title": "Your subscription link for clash clients (Clash, ClashX, ClashMeta...)",
            "includes-title": "Merged and original configs",
            "include-merged-configs-title": "Include configs merged with worker",
            "include-original-configs-title": "Include original configs",
            "max-configs-title": "Max. mumber of configs",
            "protocols-title": "Protocols",
            "clean-ips-title": "Clean IP or clean subdomain",
            "clean-ips-remarks": "One IP or subdomain per line.",
            "clean-ips-btn-title": "Find clean IPs",
            "clean-ips-btn-close-title": "Close",
            "alpn-list-title": "ALPN List",
            "alpn-list-remarks": "One item per line.",
            "fp-list-title": "Fingerprint List",
            "fp-list-remarks": "One item per line.",
            "providers-title": "Config Providers",
            "providers-auto-title": "Auto load from github",
            "providers-remarks": "One link per line (base64, yaml, raw).",
            "countries-title": "Limit By Country (Only for websites beind Cloudflare Network)",
            "countries-all-title": "If you check this option, all protocols will be deactivated except built-in protocols.",
            "personal-configs-title": "Private Configs",
            "personal-configs-remarks": "One config per line.",
            "block-porn-title": "‌Block Porn",
            "block-porn-remarks": "If you check this option, porn websites will be blocked and all protocols will be deactivated except built-in vless protocol.",
            "enable-fragments-title": "Enable Fragments",
            "enable-fragments-remarks": "If you check this option, fragments will be enabled for all TLS configs using random values.",
            "save-button": "Save",
            "reset-button": "Reset",
          },
          fa: {
            "page-title": "پنل کنترل ورکر v2ray",
            "text-version": "نسخه",
            "sub-link-title": "لینک ثبت نام شما برای کلاینت‌های v2rayN, v2rayNG, v2rayA, Nekobox, Nekoray, V2Box و...",
            // "custom-link-title": "لینک ثبت نام شما برای کانفیگ‌های Custom",
            "clash-link-title": "لینک ثبت نام شما برای کلاینت‌های کلش Clash, ClashX, ClashMeta و...",
            "includes-title": "کانفیگ‌های اصلی و ترکیبی",
            "include-merged-configs-title": "کانفیگ‌های ترکیب شده با ورکر را اضافه کن",
            "include-original-configs-title": "کانفیگ‌های اصلی را اضافه کن",
            "max-configs-title": "حداکثر تعداد کانفیگ",
            "protocols-title": "پروتکل‌ها",
            "clean-ips-title": "آی‌پی تمیز یا ساب‌دامین آی‌پی تمیز",
            "clean-ips-remarks": "در هر سطر یک آی‌پی یا ساب‌دامین وارد کنید.",
            "clean-ips-btn-title": "پیدا کردن آی‌پی تمیز",
            "clean-ips-btn-close-title": "بستن",
            "alpn-list-title": "لیست ALPN ها",
            "alpn-list-remarks": "در هر سطر یک آیتم وارد کنید.",
            "fp-list-title": "لیست فینگرپرینت‌ها",
            "fp-list-remarks": "در هر سطر یک آیتم وارد کنید.",
            "providers-title": "تامین کنندگان کانفیگ",
            "providers-auto-title": "دریافت خودکار از گیت‌هاب",
            "providers-remarks": "در هر سطر یک لینک وارد کنید (base64, yaml, raw).",
            "countries-title": "محدود کردن کشور (فقط برای وبسایت‌های پشت شبکه کلادفلر)",
            "countries-all-title": "در صورت فعال‌سازی این گزینه، تمام پروتکل‌ها بجز پروتکل‌های داخلی ورکر غیرفعال می‌شوند.",
            "personal-configs-title": "کانفیگ‌های خصوصی",
            "personal-configs-remarks": "در هر سطر یک کانفیگ وارد کنید.",
            "block-porn-title": "مسدودسازی پورن",
            "block-porn-remarks": "در صورت فعال‌سازی این گزینه، همزمان با مسدودسازی پورن تمام پروتکل‌ها بجز vless های داخلی ورکر نیز غیرفعال می‌شوند.",
            "enable-fragments-title": "فعال‌سازی فرگمنت",
            "enable-fragments-remarks": "در صورت فعال‌سازی این گزینه، فرگمنت برای تمام کانفیگ‌های TLS با مقادیر اتفاقی فعال می‌شود.",
            "save-button": "ذخیره",
            "reset-button": "بازنشانی",
          },
        }
      </script>
    </head>
    <body id="body" style="--bs-body-font-size: .875rem">
      <div class="container border mt-3 p-0 border-primary border-2 rounded">
        <div id="lang-group" class="btn-group m-2" role="group" dir="ltr"></div>
        <div class="p-2 border-bottom border-primary border-2">
          <div class="text-nowrap fs-5 fw-bold text-dark">
            <span id="page-title"></span> &nbsp;&nbsp;<span class="text-nowrap fs-6 text-info"><span id="text-version"></span> ${s}</span>
          </div>
        </div>
        ${k}
        <div class="px-4 py-2 bg-light">
          <label id="sub-link-title" for="sub-link" class="form-label fw-bold"></label>
          <input id="sub-link" readonly value="${l.origin}/sub" class="p-1" style="width: calc(100% - 150px)">
          <button onclick="let tmp=document.getElementById('sub-link');tmp.select();tmp.setSelectionRange(0,99999);navigator.clipboard.writeText(tmp.value)" class="btn btn-primary p-1 mb-1">Copy</button>
        </div>
        <div class="px-4 py-2 bg-light">
          <label id="clash-link-title" for="clash-link" class="form-label fw-bold"></label>
          <input id="clash-link" readonly value="${l.origin}/clash" class="p-1" style="width: calc(100% - 150px)">
          <button onclick="let tmp=document.getElementById('clash-link');tmp.select();tmp.setSelectionRange(0,99999);navigator.clipboard.writeText(tmp.value)" class="btn btn-primary p-1 mb-1">Copy</button>
        </div>
        <form class="px-4 py-4 border-top border-2 border-primary" method="post">
          <div class="mb-1 p-1">
            <label id="includes-title" class="form-label fw-bold"></label>
            <div id="includes">
              <div>
                <input type="checkbox" name="merged" value="yes" class="form-check-input" id="merged-ckeck" ${"yes" == u ? "checked" : ""}>
                <label id="include-merged-configs-title" class="form-check-label" for="merged-ckeck"></label>
              </div>
              <div>
                <input type="checkbox" name="original" value="yes" class="form-check-input" id="original-ckeck" ${"yes" == g ? "checked" : ""}>
                <label id="include-original-configs-title" class="form-check-label" for="original-ckeck"></label>
              </div>
            </div>
          </div>
          <div class="mb-1 p-1">
            <label id="max-configs-title" for="max-configs" class="form-label fw-bold"></label>
            <input type="number" name="max" class="form-control" id="max-configs" value="${o}" min="50"/>
            <div class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <label id="protocols-title" class="form-label fw-bold"></label>
            <div id="type">
              <div>
                <input type="checkbox" name="protocols" value="vmess" class="form-check-input" id="vmess-protocol-ckeck" ${r.includes('vmess') ? "checked" : ""} />
                <label class="form-check-label" for="vmess-protocol-ckeck">VMESS</label>
              </div>
              <div>
                <input type="checkbox" name="protocols" value="vless" class="form-check-input" id="vless-protocol-ckeck" ${r.includes('vless') ? "checked" : ""} />
                <label class="form-check-label" for="vless-protocol-ckeck">VLESS</label>
              </div>
              <div>
                <input type="checkbox" name="protocols" value="built-in-vless" class="form-check-input" id="built-in-vless-protocol-ckeck" ${r.includes('built-in-vless') ? "checked" : ""} />
                <label class="form-check-label" for="built-in-vless-protocol-ckeck">Built-in VLESS</label>
              </div>
              <div>
                <input type="checkbox" name="protocols" value="built-in-trojan" class="form-check-input" id="built-in-trojan-protocol-ckeck" ${r.includes('built-in-trojan') ? "checked" : ""} />
                <label class="form-check-label" for="built-in-trojan-protocol-ckeck">Built-in Trojan</label>
              </div>
            </div>
          </div>
          <div class="mb-1 p-1 border-top border-2 border-primary">
            <input type="checkbox" class="form-check-input" name="clean_ips_check" value="1" id="clean-ips-check" ${p.length ? "checked" : ""}>
            <label id="clean-ips-title" for="clean-ips-check" class="form-label fw-bold"></label>
            <textarea rows="5" name="clean_ips" style="display: none" class="form-control" id="clean-ips">${p.join("\n")}</textarea>
            <div id="clean-ips-remarks" style="display: none" class="form-text"></div>
            <div>
              <button id="clean-ips-btn-title" type="button" style="display: none" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#ip-scanner-modal"></button>
              <div class="modal fade" id="ip-scanner-modal" tabindex="-1" aria-labelledby="ip-scanner-modal-label" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <button id="clean-ips-btn-close-title" type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                      <iframe src="https://vfarid.github.io/cf-ip-scanner/" style="width: 100%; height: 90vh;"></iframe>
                    </div>
                  </div>
                </div>
              </div>
              </div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="enable_fragments" value="yes" id="enable-fragments" ${"yes" == b ? "checked" : ""}>
            <label id="enable-fragments-title" for="enable-fragments" class="form-label fw-bold"></label>
            <div id="enable-fragments-remarks" class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="countries_check" value="1" id="countries-check" ${h.length ? "checked" : ""}>
            <label id="countries-title" for="countries-check" class="form-label fw-bold"></label>
            <div id="countries-all-title" class="form-text"></div>
            <div id="countries-div" class="px-4 py-1">
              ${y.map((e)=>`<input type="checkbox" class="form-check-input" id="countries-check-${e.toLowerCase()}" name="countries[]" value="${e}" ${h.length && h.includes(e) ? "checked" : ""}> <label for="countries-check-${e.toLowerCase()}" class="form-label">${e}</label>`).join(" &nbsp; &nbsp;")}
            </div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="block_porn" value="yes" id="block-porn" ${"yes" == f ? "checked" : ""}>
            <label id="block-porn-title" for="block-porn" class="form-label fw-bold"></label>
            <div id="block-porn-remarks" class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="alpn_list_check" value="1" id="alpn-list-check" ${c.length ? "checked" : ""}>
            <label id="alpn-list-title" for="alpn-list-check" class="form-label fw-bold"></label>
            <textarea rows="5" name="alpn_list" style="display: none" class="form-control" id="alpn-list">${c.join("\n")}</textarea>
            <div id="alpn-list-remarks" style="display: none" class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="fp_list_check" value="1" id="fp-list-check" ${d.length ? "checked" : ""}>
            <label id="fp-list-title" for="fp-list-check" class="form-label fw-bold"></label>
            <textarea rows="5" name="fp_list" style="display: none" class="form-control" id="fp-list">${d.join("\n")}</textarea>
            <div id="fp-list-remarks" style="display: none" class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="providers_check" value="1" id="providers-check" ${v.length ? "checked" : ""}>
            <label id="providers-title" for="providers-check" class="form-label fw-bold"></label> &nbsp; &nbsp;
            <span id="providers-auto-title" class="text-info"></span>
            <textarea rows="7" name="providers" style="display: none" class="form-control" id="providers">${v.join("\n")}</textarea>
            <div id="providers-remarks"  style="display: none" class="form-text"></div>
          </div>
          <div class="mb-1 p-1">
            <input type="checkbox" class="form-check-input" name="configs_check" value="1" id="configs-check" ${m.length ? "checked" : ""}>
            <label id="personal-configs-title" for="configs-check" class="form-label fw-bold"></label>
            <textarea rows="5" name="configs" style="display: none" class="form-control" id="configs">${m.join("\n")}</textarea>
            <div id="personal-configs-remarks" style="display: none" class="form-text"></div>
          </div>
          ${x}
          <button type="submit" id="save-button" name="save" value="save" class="btn btn-primary"></button>
          <button type="submit" id="reset-button" name="reset" value="reset" class="btn btn-warning"></button>
        </form>
        <div class="p-1 border-top border-2 border-primary">
          <div class="text-nowrap fs-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" role="img" class="octicon">
              <g clip-path="url(#clip0_1668_3024)">
                <path d="M9.52217 6.77143L15.4785 0H14.0671L8.89516 5.87954L4.76437 0H0L6.24656 8.8909L0 15.9918H1.41155L6.87321 9.78279L11.2356 15.9918H16L9.52183 6.77143H9.52217ZM7.58887 8.96923L6.95596 8.0839L1.92015 1.03921H4.0882L8.15216 6.7245L8.78507 7.60983L14.0677 14.9998H11.8997L7.58887 8.96957V8.96923Z" fill="currentColor"></path>
              </g>
              <defs>
                <clipPath id="clip0_1668_3024">
                  <rect width="16" height="16" fill="white"></rect>
                </clipPath>
              </defs>
            </svg>
            <a class="link-dark link-offset-2" href="https://twitter.com/vahidfarid" target="_blank">@vahidfarid</a><br/>
            
            <svg height="16" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-mark-github v-align-middle color-fg-default">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            <a class="link-dark link-offset-2" href="https://github.com/vfarid" target="_blank">vfarid</a>            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
        return new Response(E, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    } catch (e) {
        if (e instanceof TypeError) return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf8" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
        </head>
        <body id="body" style="--bs-body-font-size: .875rem">
          <div class="container border mt-3 p-0 border-primary border-2 rounded">
            <div id="lang-group" class="btn-group m-2" role="group" dir="ltr"></div>
            <div class="p-2 border-bottom border-primary border-2">
              <div class="text-nowrap fs-5 fw-bold text-dark">
                <span id="page-title"></span> &nbsp;&nbsp;<span class="text-nowrap fs-6 text-info"><span id="text-version"></span> ${s}</span>
              </div>
            </div>
            <div class="px-5 py-2 bg-light">
              <label id="sub-link-title" for="sub-link" class="form-label fw-bold"></label>
              <input id="sub-link" readonly value="${l.origin}/sub" class="p-1" style="width: calc(100% - 150px)">
              <button onclick="let tmp=document.getElementById('sub-link');tmp.select();tmp.setSelectionRange(0,99999);navigator.clipboard.writeText(tmp.value)" class="btn btn-primary p-1 mb-1">Copy</button>
            </div>
            <div class="px-5 py-2 bg-light">
              <label id="clash-link-title" for="clash-link" class="form-label fw-bold"></label>
              <input id="clash-link" readonly value="${l.origin}/clash" class="p-1" style="width: calc(100% - 150px)">
              <button onclick="let tmp=document.getElementById('clash-link');tmp.select();tmp.setSelectionRange(0,99999);navigator.clipboard.writeText(tmp.value)" class="btn btn-primary p-1 mb-1">Copy</button>
            </div>
            <div id="you-can-use-your-worker-message" class="mx-5 my-2 p-4 border bg-success text-white fw-bold text-center"></div>
            <div class="mx-5 my-2 p-1 border bg-warning">
              <div id="you-need-namespace-message"></div>
              <ol>
                <li>
                  <a id="open-kv-text" href="https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces" target="_blank"></a>
                </li>
                <li>
                  <a id="open-variables-text" href="https://dash.cloudflare.com/?to=/:account/workers/services/view/${l.hostname.split(".")[0]}/production/settings/bindings" target="_blank"></a>
                </li>
              </ol>
            </div>
            <div class="p-1 border-top border-2 border-primary">
              <div class="text-nowrap fs-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" role="img" class="octicon">
                  <g clip-path="url(#clip0_1668_3024)">
                    <path d="M9.52217 6.77143L15.4785 0H14.0671L8.89516 5.87954L4.76437 0H0L6.24656 8.8909L0 15.9918H1.41155L6.87321 9.78279L11.2356 15.9918H16L9.52183 6.77143H9.52217ZM7.58887 8.96923L6.95596 8.0839L1.92015 1.03921H4.0882L8.15216 6.7245L8.78507 7.60983L14.0677 14.9998H11.8997L7.58887 8.96957V8.96923Z" fill="currentColor"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_1668_3024">
                      <rect width="16" height="16" fill="white"></rect>
                    </clipPath>
                  </defs>
                </svg>
                <a class="link-dark link-offset-2" href="https://twitter.com/vahidfarid" target="_blank">@vahidfarid</a><br/>
                
                <svg height="16" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-mark-github v-align-middle color-fg-default">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                </svg>
                <a class="link-dark link-offset-2" href="https://github.com/vfarid" target="_blank">vfarid</a>            </p>
              </div>
            </div>
          </div>
        </body>
        <script>
        let language = localStorage.getItem("lang") || "fa"
        window.addEventListener("load", (event) => {
          initLang();
          setLang(language);
        });
    
        function initLang() {
          document.getElementById("lang-group").innerHTML = ""
          for (code in strings) {
            const el = document.createElement("button")
            el.classList = "btn btn-outline-primary btn-sm rounded-2"
            el.id = \`btn-\${code}\`
            el.type = "button"
            el.innerText = code.toUpperCase()
            el.setAttribute("data-lang", code);
            el.addEventListener("click", (e) => {
                setLang(e.srcElement.getAttribute("data-lang"))
            })
            document.getElementById("lang-group").appendChild(el)
    
            const el2 = document.createElement("span")
            el2.innerHTML = "&nbsp;"
            document.getElementById("lang-group").appendChild(el2)
          }
        }
      
        function setLang(code) {
          if (strings[code] === undefined) {
            code = "en"
          }
          
          document.getElementById('body').style.direction = languages[code]?.dir || "ltr"
          document.getElementById('lang-group').style.float = languages[code]?.end || "left"
          document.getElementById('btn-' + language).classList.remove('btn-primary')
          document.getElementById('btn-' + language).classList.add('btn-outline-primary')
          document.getElementById('btn-' + code).classList.remove('btn-outline-primary')
          document.getElementById('btn-' + code).classList.add('btn-primary')
          
          for (key in strings[code]) {
            document.getElementById(key).innerText = strings[code][key]
          }
      
          language = code
          localStorage.setItem('lang', code);
        }
    
        const languages = {
          en: {dir: "ltr", end: "right"},
          fa: {dir: "rtl", end: "left"},
        }
      
        const strings = {
          en: {
            "page-title": "V2ray Worker Control Panel",
            "text-version": "Version",
            "sub-link-title": "Your subscription link for v2ray clients (v2rayN, v2rayNG, v2rayA, Nekobox, Nekoray, V2Box...)",
            // "custom-link-title": "Your subscription link for custom configs",
            "clash-link-title": "Your subscription link for clash clients (Clash, ClashX, ClashMeta...)",
            "you-can-use-your-worker-message": "You can continue using your worker without control panel.",
            "you-need-namespace-message": "The 'settings' namespace is not defined! Please define a namespace named 'settings' in your worker 'KV Namespace Bindings' using bellow link, as described in the video and relad the page afterward.",  
            "open-kv-text": "Open KV",
            "open-variables-text": "Open Worker's Variables",
          },
          fa: {
            "page-title": "پنل کنترل ورکر v2ray",
            "text-version": "نسخه",
            "sub-link-title": "لینک ثبت نام شما برای کلاینت‌های v2rayN, v2rayNG, v2rayA, Nekobox, Nekoray, V2Box و...",
            // "custom-link-title": "لینک ثبت نام شما برای کانفیگ‌های Custom",
            "clash-link-title": "لینک ثبت نام شما برای کلاینت‌های کلش Clash, ClashX, ClashMeta و...",
            "you-can-use-your-worker-message": "شما می‌توانید از ورکر خود بدون پنل کنترل استفاده نمایید.",
            "you-need-namespace-message": "فضای نام settings تعریف نشده است. لطفا مطابق ویدیوی آموزشی، از طریق لینک‌های زیر ابتدا در بخش KV یک فضای نام به اسم settings ایجاد کنید و سپس ازطریق بخش 'KV Namespace Bindings' آن را با همان نام settings به ورکر خود متصل کنید و پس از ذخیره، مجددا پنل را باز کنید.",
            "open-kv-text": "بازکردن بخش KV",
            "open-variables-text": "بازکردن بخش متغیرهای ورکر",
          },
        }
        </script>
        </html>
      `, {
            headers: {
                "Content-Type": "text/html"
            }
        });
        throw e;
    }
}
export async function PostPanel(n, i) {
    let l = new URL(n.url), a = await i.settings.get("Token");
    try {
        let o = await n.formData(), r = await i.settings.get("Password");
        if (r && l.searchParams.get("token") != a) return Response.redirect(`${l.origin}/login`, 302);
        if (o.get("reset_password")) return await i.settings.delete("Password"), await i.settings.delete("Token"), Response.redirect(`${l.origin}?message=success`, 302);
        if (o.get("save")) {
            let n = o.get("password")?.toString() || "";
            if (n) {
                if (n.length < 6 || n !== o.get("password_confirmation")) return Response.redirect(`${l.origin}?message=invalid-password`, 302);
                r = await e.hash(n, 10), a = t(24), await i.settings.put("Password", r), await i.settings.put("Token", a);
            }
            let c = parseInt(o.get("max")?.toString() || "200");
            c < 50 && (c = 50), await i.settings.put("MaxConfigs", c.toString()), await i.settings.put("Protocols", o.getAll("protocols")?.join("\n").trim()), await i.settings.put("ALPNs", o.get("alpn_list_check")?.toString() && o.get("alpn_list")?.toString().trim().split("\n").map((e)=>e.trim()).join("\n") || ""), await i.settings.put("FingerPrints", o.get("fp_list_check")?.toString() && o.get("fp_list")?.toString().trim().split("\n").map((e)=>e.trim()).join("\n") || ""), await i.settings.put("Providers", o.get("providers_check")?.toString() && o.get("providers")?.toString().trim().split("\n").map((e)=>e.trim()).join("\n") || ""), await i.settings.put("Countries", o.get("countries_check")?.toString() && o.getAll("countries[]")?.join(",") || ""), await i.settings.put("CleanDomainIPs", o.get("clean_ips_check")?.toString() && o.get("clean_ips")?.toString().trim().split("\n").map((e)=>e.trim()).join("\n") || ""), await i.settings.put("Configs", o.get("configs_check")?.toString() && o.get("configs")?.toString().trim().split("\n").map((e)=>e.trim()).join("\n") || ""), await i.settings.put("IncludeOriginalConfigs", o.get("original")?.toString() || "no"), await i.settings.put("IncludeMergedConfigs", o.get("merged")?.toString() || "no"), await i.settings.put("BlockPorn", o.get("block_porn")?.toString() || "no"), await i.settings.put("EnableFragments", o.get("enable_fragments")?.toString() || "no"), await i.settings.put("Version", s);
        } else await i.settings.delete("MaxConfigs"), await i.settings.delete("Protocols"), await i.settings.delete("ALPNs"), await i.settings.delete("FingerPrints"), await i.settings.delete("Providers"), await i.settings.delete("Countries"), await i.settings.delete("CleanDomainIPs"), await i.settings.delete("Configs"), await i.settings.delete("IncludeOriginalConfigs"), await i.settings.delete("IncludeMergedConfigs"), await i.settings.delete("UUID"), await i.settings.delete("Password"), await i.settings.delete("Token"), await i.settings.delete("BlockPorn"), await i.settings.delete("EnableFragments");
        return Response.redirect(`${l.origin}?message=success${a ? "&token=" + a : ""}`, 302);
    } catch (e) {
        return Response.redirect(`${l.origin}?message=error${a ? "&token=" + a : ""}`, 302);
    }
}

import 'qrcode';

import { Buffer as o } from 'buffer';
import { EncodeConfig as r } from './config';
export function ToRawSubscription(o) {
    return o.map(r).join("\n");
}
export function ToBase64Subscription(n) {
    return o.from(n.map(r).join("\n"), "utf-8").toString("base64");
}

import { connect as e } from 'cloudflare:sockets';
import { GetTrojanConfig as t, MuddleDomain as r, getSHA224Password as a, getUUID as n } from "./helpers";
import { cfPorts as i, proxiesUri as l } from "./variables";
let s = "", o = [], c = [];
export async function GetTrojanConfigList(e, a, l, s, c) {
    o = [];
    let u = [];
    for(let o = 0; o < s; o++)u.push(t(o + l, n(e), r(e), a[Math.floor(Math.random() * a.length)], i[Math.floor(Math.random() * i.length)]));
    return u;
}
export async function TrojanOverWSHandler(e, t, r) {
    var i, l;
    let s, o = a(n(t)), [c, h] = Object.values(new WebSocketPair);
    h.accept();
    let w = (i = h, l = e.headers.get("sec-websocket-protocol") || "", s = !1, new ReadableStream({
        start (e) {
            i.addEventListener("message", (t)=>{
                if (s) return;
                let r = t.data;
                e.enqueue(r);
            }), i.addEventListener("close", ()=>{
                f(i), !s && e.close();
            }), i.addEventListener("error", (t)=>{
                e.error(t);
            });
            let { earlyData: t, error: r } = function(e) {
                if (!e) return {
                    earlyData: null,
                    error: null
                };
                try {
                    e = e.replace(/-/g, '+').replace(/_/g, '/');
                    let t = atob(e);
                    return {
                        earlyData: Uint8Array.from(t, (e)=>e.charCodeAt(0)).buffer,
                        error: null
                    };
                } catch (e) {
                    return {
                        earlyData: null,
                        error: e
                    };
                }
            }(l);
            r ? e.error(r) : t && e.enqueue(t);
        },
        pull (e) {},
        cancel (e) {
            !s && (s = !0, f(i));
        }
    })), m = {
        value: null
    };
    return w.pipeTo(new WritableStream({
        async write (e, t) {
            if (m.value) {
                let t = m.value.writable.getWriter();
                await t.write(e), t.releaseLock();
                return;
            }
            let { hasError: a, message: n, portRemote: i = 443, addressRemote: l = "", rawClientData: s } = await u(e, o);
            if (a) throw Error(n);
            d(m, l, i, s, h, r);
        }
    })).catch((e)=>{}), new Response(null, {
        status: 101,
        webSocket: c
    });
}
async function u(e, t) {
    if (e.byteLength < 56) return {
        hasError: !0,
        message: "invalid data"
    };
    if (0x0d !== new Uint8Array(e.slice(56, 57))[0] || 0x0a !== new Uint8Array(e.slice(57, 58))[0]) return {
        hasError: !0,
        message: "invalid header format (missing CR LF)"
    };
    if (new TextDecoder().decode(e.slice(0, 56)) !== t) return {
        hasError: !0,
        message: "invalid password"
    };
    let r = e.slice(58);
    if (r.byteLength < 6) return {
        hasError: !0,
        message: "invalid SOCKS5 request data"
    };
    let a = new DataView(r);
    if (1 !== a.getUint8(0)) return {
        hasError: !0,
        message: "unsupported command, only TCP (CONNECT) is allowed"
    };
    let n = a.getUint8(1), i = 0, l = 2, s = "";
    switch(n){
        case 1:
            i = 4, s = new Uint8Array(r.slice(l, l + i)).join(".");
            break;
        case 3:
            i = new Uint8Array(r.slice(l, l + 1))[0], l += 1, s = new TextDecoder().decode(r.slice(l, l + i));
            break;
        case 4:
            i = 16;
            let o = new DataView(r.slice(l, l + i)), c = [];
            for(let e = 0; e < 8; e++)c.push(o.getUint16(2 * e).toString(16));
            s = c.join(":");
            break;
        default:
            return {
                hasError: !0,
                message: `invalid addressType is ${n}`
            };
    }
    if (!s) return {
        hasError: !0,
        message: `address is empty, addressType is ${n}`
    };
    let u = l + i;
    return {
        hasError: !1,
        addressRemote: s,
        portRemote: new DataView(r.slice(u, u + 2)).getUint16(0),
        rawClientData: r.slice(u + 4)
    };
}
async function d(t, r, a, n, i, u) {
    let d = 0;
    async function f(r, a) {
        let i = e({
            hostname: r,
            port: a
        });
        t.value = i;
        let l = i.writable.getWriter();
        return await l.write(n), l.releaseLock(), i;
    }
    async function w() {
        !(++d > 5) && (o.length || (c = (await u.settings.get("Countries"))?.split(",").filter((e)=>e.trim().length > 0) || [], o = await fetch(l).then((e)=>e.text()).then((e)=>e.trim().split("\n").filter((e)=>e.trim().length > 0)), c.length > 0 && (o = o.filter((e)=>{
            let t = e.split(",");
            if (t.length > 0) return c.includes(t[1]);
        })), o = o.map((e)=>e.split(",")[0])), o.length > 0 && (s = o[Math.floor(Math.random() * o.length)], h(await f(s, a), i, w)));
    }
    h(await f(r, a), i, w);
}
async function h(e, t, r) {
    let a = !1;
    await e.readable.pipeTo(new WritableStream({
        async write (e, r) {
            try {
                a = !0, 1 !== t.readyState && r.error("webSocket.readyState is not open, maybe close"), t.send(e);
            } catch (e) {}
        },
        abort (e) {}
    })).catch((e)=>{
        f(t);
    }), !1 === a && r && r();
}
function f(e) {
    try {
        (1 === e.readyState || 2 === e.readyState) && e.close();
    } catch (e) {}
}

export const version = "2.4";
export const providersUri = "https://raw.githubusercontent.com/vfarid/v2ray-worker/main/resources/provider-list.txt";
export const proxiesUri = "https://raw.githubusercontent.com/vfarid/v2ray-worker/main/resources/proxy-list.txt";
export const defaultProtocols = [
    "vmess",
    "built-in-vless",
    "vless",
    "built-in-trojan"
];
export const defaultALPNList = [
    "h3,h2,http/1.1",
    "h3,h2,http/1.1",
    "h3,h2,http/1.1",
    "h3,h2",
    "h2,http/1.1",
    "h2",
    "http/1.1"
];
export const defaultPFList = [
    "chrome",
    "firefox",
    "randomized",
    "safari",
    "chrome",
    "edge",
    "randomized",
    "ios",
    "chrome",
    "android",
    "randomized"
];
export const cfPorts = [
    443,
    2053,
    2083,
    2087,
    2096,
    8443
];
export const supportedCiphers = [
    "none",
    "auto",
    "plain",
    "aes-128-cfb",
    "aes-192-cfb",
    "aes-256-cfb",
    "rc4-md5",
    "chacha20-ietf",
    "xchacha20",
    "chacha20-ietf-poly1305"
];
export const fragmentsLengthList = [
    "10-20",
    "10-50",
    "20-50",
    "30-80",
    "50-100"
];
export const fragmentsIntervalList = [
    "10-20",
    "10-50",
    "20-50"
];
export const defaultClashConfig = {
    port: 7890,
    "socks-port": 7891,
    "allow-lan": !1,
    mode: "rule",
    "log-level": "info",
    "external-controller": "127.0.0.1:9090",
    dns: {
        enable: !0,
        ipv6: !1,
        "enhanced-mode": "fake-ip",
        nameserver: [
            "114.114.114.114",
            "223.5.5.5",
            "8.8.8.8",
            "9.9.9.9",
            "1.1.1.1",
            "https://dns.google/dns-query",
            "tls://dns.google:853"
        ]
    },
    proxies: [],
    "proxy-groups": [],
    rules: [
        "GEOIP,IR,DIRECT",
        "DOMAIN-SUFFIX,ir,DIRECT",
        "IP-CIDR,127.0.0.0/8,DIRECT",
        "IP-CIDR,192.168.0.0/16,DIRECT",
        "IP-CIDR,172.16.0.0/12,DIRECT",
        "IP-CIDR,10.0.0.0/8,DIRECT",
        "MATCH,All"
    ]
};
export const defaultV2rayConfig = {
    stats: {},
    log: {
        loglevel: "warning"
    },
    policy: {
        levels: {
            8: {
                handshake: 4,
                connIdle: 300,
                uplinkOnly: 1,
                downlinkOnly: 1
            }
        },
        system: {
            statsOutboundUplink: !0,
            statsOutboundDownlink: !0
        }
    },
    inbounds: [
        {
            tag: "socks",
            port: 10808,
            protocol: "socks",
            settings: {
                auth: "noauth",
                udp: !0,
                userLevel: 8
            },
            sniffing: {
                enabled: !0,
                destOverride: [
                    "http",
                    "tls"
                ]
            }
        },
        {
            tag: "http",
            port: 10809,
            protocol: "http",
            settings: {
                userLevel: 8
            }
        }
    ],
    outbounds: [
        {
            tag: "proxy",
            protocol: "",
            settings: {
                vnext: [
                    {
                        address: "",
                        port: 443,
                        users: [
                            {
                                id: "",
                                alterId: 0,
                                security: "auto",
                                level: 8,
                                encryption: "none",
                                flow: ""
                            }
                        ]
                    }
                ]
            },
            streamSettings: {
                network: "tcp",
                security: "",
                sockopts: {}
            },
            mux: {
                enabled: !1
            }
        },
        {
            protocol: "freedom",
            settings: {},
            tag: "direct"
        },
        {
            protocol: "blackhole",
            tag: "block",
            settings: {
                response: {
                    type: "http"
                }
            }
        }
    ],
    routing: {
        domainStrategy: "IPIfNonMatch",
        rules: []
    },
    dns: {
        hosts: {},
        servers: []
    }
};

import { connect as e } from 'cloudflare:sockets';
import { GetVlessConfig as t, MuddleDomain as r, getUUID as a } from "./helpers";
import { cfPorts as n, proxiesUri as i } from "./variables";
let l = "", s = [], o = "", c = [];
export async function GetVlessConfigList(e, i, l, c, u) {
    o = "", s = [];
    let f = a(e), w = [];
    for(let a = 0; a < c; a++)w.push(t(a + l, f, r(e), i[Math.floor(Math.random() * i.length)], n[Math.floor(Math.random() * n.length)]));
    return w;
}
export async function VlessOverWSHandler(e, t, r) {
    var n, i;
    let l, s = a(t), [o, c] = Object.values(new WebSocketPair);
    c.accept();
    let w = (n = c, i = e.headers.get("sec-websocket-protocol") || "", l = !1, new ReadableStream({
        start (e) {
            n.addEventListener('message', (t)=>{
                if (l) return;
                let r = t.data;
                e.enqueue(r);
            }), n.addEventListener('close', ()=>{
                d(n), !l && e.close();
            }), n.addEventListener('error', (t)=>{
                e.error(t);
            });
            let { earlyData: t, error: r } = function(e) {
                if (!e) return {
                    earlyData: null,
                    error: null
                };
                try {
                    e = e.replace(/-/g, '+').replace(/_/g, '/');
                    let t = atob(e);
                    return {
                        earlyData: Uint8Array.from(t, (e)=>e.charCodeAt(0)).buffer,
                        error: null
                    };
                } catch (e) {
                    return {
                        earlyData: null,
                        error: e
                    };
                }
            }(i);
            r ? e.error(r) : t && e.enqueue(t);
        },
        cancel (e) {
            !l && (l = !0, d(n));
        }
    })), h = {
        value: null
    }, p = null, m = !1;
    return w.pipeTo(new WritableStream({
        async write (e, t) {
            if (m && p) return p(e);
            if (h.value) {
                let t = h.value.writable.getWriter();
                await t.write(e), t.releaseLock();
                return;
            }
            let { hasError: a, message: n, addressRemote: i = '', addressType: l, portRemote: o = 443, rawDataIndex: w, vlessVersion: d = new Uint8Array([
                0,
                0
            ]), isUDP: g, isMUX: b } = function(e, t) {
                if (e.byteLength < 24) return {
                    hasError: !0,
                    message: 'Invalid data'
                };
                let r = new Uint8Array(e.slice(0, 1)), a = !1, n = !1, i = !1;
                if (function(e, t = 0) {
                    let r = function(e, t = 0) {
                        return `${y[e[t + 0]] + y[e[t + 1]] + y[e[t + 2]] + y[e[t + 3]]}-${y[e[t + 4]] + y[e[t + 5]]}-${y[e[t + 6]] + y[e[t + 7]]}-${y[e[t + 8]] + y[e[t + 9]]}-${y[e[t + 10]] + y[e[t + 11]] + y[e[t + 12]] + y[e[t + 13]] + y[e[t + 14]] + y[e[t + 15]]}`.toLowerCase();
                    }(e, t);
                    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r)) throw TypeError("Stringified UUID is invalid");
                    return r;
                }(new Uint8Array(e.slice(1, 17))) === t && (a = !0), !a) return {
                    hasError: !0,
                    message: 'Invalid user'
                };
                let l = new Uint8Array(e.slice(17, 18))[0], s = new Uint8Array(e.slice(18 + l, 18 + l + 1))[0];
                if (1 === s) ;
                else if (2 === s) n = !0;
                else {
                    if (3 !== s) return {
                        hasError: !0,
                        message: `Command ${s} is not support, command 01-tcp, 02-udp, 03-mux`
                    };
                    i = !0;
                }
                let o = 18 + l + 1, c = new DataView(e.slice(o, o + 2)).getUint16(0), u = o + 2, f = new Uint8Array(e.slice(u, u + 1))[0], w = 0, d = u + 1, h = "";
                switch(f){
                    case 1:
                        w = 4, h = new Uint8Array(e.slice(d, d + w)).join(".");
                        break;
                    case 2:
                        w = new Uint8Array(e.slice(d, d + 1))[0], d += 1, h = new TextDecoder().decode(e.slice(d, d + w));
                        break;
                    case 3:
                        w = 16;
                        let p = new DataView(e.slice(d, d + w)), m = [];
                        for(let e = 0; e < 8; e++)m.push(p.getUint16(2 * e).toString(16));
                        h = m.join(":");
                        break;
                    default:
                        return {
                            hasError: !0,
                            message: `invild  addressType is ${f}`
                        };
                }
                return h ? {
                    hasError: !1,
                    addressRemote: h,
                    addressType: f,
                    portRemote: c,
                    rawDataIndex: d + w,
                    vlessVersion: r,
                    isUDP: n,
                    isMUX: i
                } : {
                    hasError: !0,
                    message: `addressValue is empty, addressType is ${f}`
                };
            }(e, s);
            if (a) throw Error(n);
            if (g) {
                if (53 === o) m = !0;
                else throw Error('UDP proxy only enable for DNS which is port 53');
            } else if (b) throw Error('MUX is not supported!');
            let U = new Uint8Array([
                d[0],
                0
            ]), S = e.slice(w);
            if (m) {
                let { write: e } = await u(c, U, r);
                (p = e)(S);
                return;
            }
            f(h, i, o, S, c, U, r);
        }
    })).catch((e)=>{}), new Response(null, {
        status: 101,
        webSocket: o
    });
}
async function u(e, t, r) {
    let a = !1, n = new TransformStream({
        transform (e, t) {
            for(let r = 0; r < e.byteLength;){
                let a = new DataView(e.slice(r, r + 2)).getUint16(0), n = new Uint8Array(e.slice(r + 2, r + 2 + a));
                r = r + 2 + a, t.enqueue(n);
            }
        }
    });
    "" == o && (o = await r.settings.get("BlockPorn") || 'no'), n.readable.pipeTo(new WritableStream({
        async write (r) {
            let n = await fetch("yes" == o ? "https://1.1.1.3/dns-query" : "https://1.1.1.1/dns-query", {
                method: 'POST',
                headers: {
                    'content-type': 'application/dns-message'
                },
                body: r
            }), i = await n.arrayBuffer(), l = i.byteLength, s = new Uint8Array([
                l >> 8 & 0xff,
                0xff & l
            ]);
            1 === e.readyState && (a ? e.send(await new Blob([
                s,
                i
            ]).arrayBuffer()) : (e.send(await new Blob([
                t,
                s,
                i
            ]).arrayBuffer()), a = !0));
        }
    })).catch((e)=>{});
    let i = n.writable.getWriter();
    return {
        write (e) {
            i.write(e);
        }
    };
}
async function f(t, r, a, n, o, u, f) {
    let d = 0;
    async function y(r, a) {
        let i = e({
            hostname: r,
            port: a
        }, {
            allowHalfOpen: !1
        });
        t.value = i;
        let l = i.writable.getWriter();
        return await l.write(n), l.releaseLock(), i;
    }
    async function h() {
        !(++d > 5) && (s.length || (c = (await f.settings.get("Countries"))?.split(",").filter((e)=>e.trim().length > 0) || [], s = await fetch(i).then((e)=>e.text()).then((e)=>e.trim().split("\n").filter((e)=>e.trim().length > 0)), c.length > 0 && (s = s.filter((e)=>{
            let t = e.split(",");
            if (t.length > 0) return c.includes(t[1]);
        })), console.log(s = s.map((e)=>e.split(",")[0]))), s.length > 0 && (l = s[Math.floor(Math.random() * s.length)], w(await y(l, a), o, u, h)));
    }
    w(await y(r, a), o, u, h);
}
async function w(e, t, r, a) {
    let n = r, i = !1;
    await e.readable.pipeTo(new WritableStream({
        async write (e, r) {
            try {
                i = !0, 1 !== t.readyState && r.error("webSocket.readyState is not open, maybe close"), n ? (t.send(await new Blob([
                    n,
                    e
                ]).arrayBuffer()), n = null) : t.send(e);
            } catch (e) {}
        },
        abort (e) {}
    })).catch((e)=>{
        d(t);
    }), !1 === i && a && a();
}
function d(e) {
    try {
        (1 === e.readyState || 2 === e.readyState) && e.close();
    } catch (e) {}
}
let y = [];
for(let e = 0; e < 256; ++e)y.push((e + 256).toString(16).slice(1));

import { VlessOverWSHandler as e } from "./vless";
import { TrojanOverWSHandler as r } from "./trojan";
import { GetPanel as t, PostPanel as o } from "./panel";
import { GetLogin as n, PostLogin as s } from "./auth";
import { GetConfigList as m } from "./collector";
import { ToYamlSubscription as a } from "./clash";
import { ToBase64Subscription as i, ToRawSubscription as f } from "./sub";
export default {
    async fetch (l, u) {
        let h = new URL(l.url), p = h.pathname.replace(/^\/|\/$/g, ""), w = p.toLowerCase();
        if ([
            "sub",
            "clash",
            "raw"
        ].includes(w)) {
            let e = await m(h, u);
            return new Response("clash" == w ? a(e) : "raw" == w ? f(e) : i(e));
        }
        if ("vless-ws" == w) return e(l, h.hostname, u);
        if ("trojan-ws" == w) return r(l, h.hostname, u);
        if ("login" == w) {
            if ("GET" === l.method) return n(l, u);
            if ("POST" === l.method) return s(l, u);
        } else {
            if (p) return fetch(new Request(new URL("https://" + p), l));
            if ("GET" === l.method) return t(l, u);
            if ("POST" === l.method) return o(l, u);
        }
        return new Response("Invalid request!");
    }
};

