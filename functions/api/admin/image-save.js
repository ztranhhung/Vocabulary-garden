import { isAdmin, json, unauthorized } from "./_auth.js";
export async function onRequest({request,env}) {
  if (!(await isAdmin(request,env.ADMIN_PASSWORD))) return unauthorized();
  if (request.method !== "POST") return json({error:"Phương thức không được hỗ trợ."},405,{Allow:"POST"});
  if (!env.VG_IMAGES) return json({error:"Chưa cấu hình kho ảnh Cloudflare R2. Cần tạo bucket và gắn binding VG_IMAGES trước khi lưu ảnh AI."},503);
  if (!env.IMAGE_PUBLIC_BASE_URL) return json({error:"Chưa cấu hình IMAGE_PUBLIC_BASE_URL là URL công khai HTTPS của bucket ảnh."},503);
  let body; try { body=await request.json(); } catch { return json({error:"Dữ liệu không hợp lệ."},400); }
  const data=String(body.image_data||""), word=String(body.english||"word");
  const match=data.match(/^data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return json({error:"Ảnh xem trước không hợp lệ. Hãy tạo ảnh lại."},400);
  if (data.length>12_000_000) return json({error:"Ảnh quá lớn. Hãy tạo lại ảnh."},413);
  try {
    const binary=atob(match[2]), bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const ext=match[1]==="jpeg"?"jpg":match[1];
    const slug=word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50)||"word";
    const key=`word-illustrations/${slug}-${crypto.randomUUID()}.${ext}`;
    await env.VG_IMAGES.put(key,bytes,{httpMetadata:{contentType:`image/${match[1]}`,cacheControl:"public, max-age=31536000, immutable"}});
    return json({image_url:`${String(env.IMAGE_PUBLIC_BASE_URL).replace(/\/$/,"")}/${key}`},201);
  } catch { return json({error:"Không lưu được ảnh vào R2. Hãy kiểm tra cấu hình bucket."},500); }
}
