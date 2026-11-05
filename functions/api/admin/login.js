import { makeCookie, json } from "./_auth.js";
export async function onRequestPost({request,env}) {
  if(!env.ADMIN_PASSWORD) return json({error:"Chưa cấu hình ADMIN_PASSWORD trong Cloudflare."},503);
  let body; try{body=await request.json()}catch{return json({error:"Dữ liệu không hợp lệ."},400);}
  const supplied=String(body.password||""), expected=String(env.ADMIN_PASSWORD);
  if(supplied.length!==expected.length) return json({error:"Mật khẩu chưa đúng."},401);
  let diff=0; for(let i=0;i<expected.length;i++) diff|=supplied.charCodeAt(i)^expected.charCodeAt(i);
  if(diff!==0) return json({error:"Mật khẩu chưa đúng."},401);
  return json({ok:true},200,{"Set-Cookie":await makeCookie(expected)});
}
