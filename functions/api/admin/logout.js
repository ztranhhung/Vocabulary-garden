import { json } from "./_auth.js";
export async function onRequestPost() {
  return json({ok:true},200,{"Set-Cookie":"vg_admin=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});
}
