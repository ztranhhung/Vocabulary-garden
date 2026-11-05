import { isAdmin, json, unauthorized } from "./_auth.js";
export async function onRequest({request,env}) {
  if (!(await isAdmin(request,env.ADMIN_PASSWORD))) return unauthorized();
  if (request.method !== "POST") return json({error:"Phương thức không được hỗ trợ."},405,{Allow:"POST"});
  if (!env.OPENAI_API_KEY) return json({error:"Chưa cấu hình OPENAI_API_KEY trong Cloudflare Pages → Settings → Variables and Secrets."},503);
  let body; try { body=await request.json(); } catch { return json({error:"Dữ liệu không hợp lệ."},400); }
  const word=String(body.english||"").trim(), meaning=String(body.vietnamese||"").trim();
  if (!word || !meaning) return json({error:"Hãy nhập từ tiếng Anh và nghĩa tiếng Việt trước."},400);
  if (word.length>100 || meaning.length>200) return json({error:"Từ hoặc nghĩa quá dài."},400);
  const prompt=`Create one clear, charming, consistent-style educational cartoon illustration for an English vocabulary learning website. The exact concept is the English word “${word}”, meaning “${meaning}” in Vietnamese. Show one obvious central subject/action that unmistakably teaches this word. Cute polished 2D children's picture-book style, warm natural colors, clean shapes, soft light, simple uncluttered background, centered composition, square image. No text, no letters, no watermark, no border, no collage, no multiple panels.`;
  try {
    const response=await fetch("https://api.openai.com/v1/images/generations",{
      method:"POST",headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:"gpt-image-2",prompt,size:"1024x1024",quality:"low",output_format:"webp"})
    });
    const data=await response.json();
    if(!response.ok) return json({error:data.error?.message||"Không tạo được ảnh AI."},502);
    const item=data.data?.[0];
    if(!item?.b64_json) return json({error:"AI không trả về dữ liệu ảnh."},502);
    return json({image_data:"data:image/webp;base64,"+item.b64_json, mime_type:"image/webp"});
  } catch { return json({error:"Không kết nối được dịch vụ tạo ảnh. Hãy thử lại."},502); }
}
