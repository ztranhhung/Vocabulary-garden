import { isAdmin, json, unauthorized } from "./_auth.js";
export async function onRequest({request,env}) {
  if(!(await isAdmin(request,env.ADMIN_PASSWORD))) return unauthorized();
  if(!env.DB) return json({error:"Chưa kết nối D1 binding DB."},503);
  if(request.method==="GET") {
    const {results}=await env.DB.prepare("SELECT id,english,vietnamese,ipa,category,image_url,created_at,updated_at FROM vocabulary ORDER BY id DESC").all();
    return json({words:results||[]});
  }
  let body; try{body=await request.json()}catch{return json({error:"Dữ liệu không hợp lệ."},400);}
  if(request.method==="POST"||request.method==="PUT") {
    const english=String(body.english||"").trim(), vietnamese=String(body.vietnamese||"").trim();
    const ipa=String(body.ipa||"").trim(), category=String(body.category||"").trim(), image_url=String(body.image_url||"").trim();
    if(!english||!vietnamese||!category) return json({error:"Cần nhập từ tiếng Anh, nghĩa tiếng Việt và chủ đề."},400);
    if(english.length>100||vietnamese.length>200||ipa.length>100||category.length>80||image_url.length>1000) return json({error:"Thông tin vượt quá độ dài cho phép."},400);
    if(image_url&&!/^https:\/\//i.test(image_url)) return json({error:"Đường dẫn ảnh phải bắt đầu bằng https://."},400);
    try {
      if(request.method==="POST") {
        const result=await env.DB.prepare("INSERT INTO vocabulary (english,vietnamese,ipa,category,image_url) VALUES (?,?,?,?,?)").bind(english,vietnamese,ipa,category,image_url).run();
        return json({ok:true,id:result.meta.last_row_id},201);
      }
      const id=Number(body.id); if(!Number.isInteger(id)||id<1) return json({error:"ID không hợp lệ."},400);
      const result=await env.DB.prepare("UPDATE vocabulary SET english=?,vietnamese=?,ipa=?,category=?,image_url=?,updated_at=datetime('now') WHERE id=?").bind(english,vietnamese,ipa,category,image_url,id).run();
      if(!result.meta.changes) return json({error:"Không tìm thấy từ cần sửa."},404);
      return json({ok:true});
    } catch(error) {
      if(String(error).includes("UNIQUE")) return json({error:"Từ này đã có trong chủ đề đó."},409);
      return json({error:"Không lưu được dữ liệu. Hãy kiểm tra và thử lại."},500);
    }
  }
  if(request.method==="DELETE") {
    const id=Number(body.id); if(!Number.isInteger(id)||id<1) return json({error:"ID không hợp lệ."},400);
    const result=await env.DB.prepare("DELETE FROM vocabulary WHERE id=?").bind(id).run();
    if(!result.meta.changes) return json({error:"Không tìm thấy từ cần xóa."},404);
    return json({ok:true});
  }
  return json({error:"Phương thức không được hỗ trợ."},405,{Allow:"GET, POST, PUT, DELETE"});
}
