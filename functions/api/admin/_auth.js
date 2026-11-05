const COOKIE = "vg_admin";
const enc = new TextEncoder();

async function sign(payload, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
export async function makeCookie(secret) {
  const payload = String(Math.floor(Date.now()/1000) + 8*60*60);
  return `${COOKIE}=${payload}.${await sign(payload,secret)}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
export async function isAdmin(request, secret) {
  if (!secret) return false;
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  if (!item) return false;
  const token=item.slice(COOKIE.length+1), dot=token.indexOf(".");
  if(dot<1) return false;
  const payload=token.slice(0,dot), supplied=token.slice(dot+1);
  if(!/^\d+$/.test(payload) || Number(payload)<Math.floor(Date.now()/1000)) return false;
  const expected=await sign(payload,secret);
  if(supplied.length!==expected.length) return false;
  let diff=0; for(let i=0;i<expected.length;i++) diff |= supplied.charCodeAt(i)^expected.charCodeAt(i);
  return diff===0;
}
export function json(data,status=200,headers={}) {
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}});
}
export function unauthorized(){return json({error:"Phiên quản trị hết hạn. Vui lòng đăng nhập lại."},401);}
