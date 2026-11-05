import { isAdmin, json, unauthorized } from "./_auth.js";
export async function onRequest({request,env}) {
  if (!(await isAdmin(request,env.ADMIN_PASSWORD))) return unauthorized();
  if (request.method !== "POST") return json({error:"Phương thức không được hỗ trợ."},405,{Allow:"POST"});
  if (!env.OPENAI_API_KEY) return json({error:"Chưa cấu hình OPENAI_API_KEY trong Cloudflare Pages → Settings → Variables and Secrets."},503);
  let body; try { body=await request.json(); } catch { return json({error:"Dữ liệu không hợp lệ."},400); }
  const word=String(body.english||"").trim();
  if (!word || word.length>100) return json({error:"Hãy nhập từ tiếng Anh trước."},400);
  try {
    const response=await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:"gpt-4.1-mini",temperature:0.1,max_tokens:120,messages:[
        {role:"system",content:"You are an English pronunciation dictionary editor. Return only General American (US) IPA transcription, enclosed in slashes, for the exact English word or phrase. If it has multiple common pronunciations, return the most common one. No explanation."},
        {role:"user",content:word}
      ]})
    });
    const data=await response.json();
    if(!response.ok) return json({error:data.error?.message||"Không lấy được IPA từ AI."},502);
    const ipa=String(data.choices?.[0]?.message?.content||"").trim();
    if(!ipa) return json({error:"AI không trả về IPA. Hãy thử lại."},502);
    return json({ipa});
  } catch { return json({error:"Không kết nối được dịch vụ AI. Hãy thử lại."},502); }
}
