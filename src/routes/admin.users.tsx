import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search, Plus, X, Eye, EyeOff, KeyRound, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const ROLES = ["","admin","lab_staff","dentist"];
const ROLE_CHIP: Record<string,string> = { admin:"bg-red-50 text-red-600", lab_staff:"bg-violet-50 text-violet-600", dentist:"bg-cyan-50 text-cyan-700" };

function AdminUsers() {
  const [data,setData]=useState<any>(null);
  const [search,setSearch]=useState("");
  const [roleFilter,setRoleFilter]=useState("");
  const [page,setPage]=useState(1);
  const [modal,setModal]=useState<"create"|"edit"|"reset"|"delete"|null>(null);
  const [target,setTarget]=useState<any>(null);
  const [form,setForm]=useState({name:"",email:"",role:"dentist",phone:"",gdcNumber:"",password:""});
  const [editForm,setEditForm]=useState({name:"",email:"",role:"dentist",phone:"",gdcNumber:"",password:"",confirmPassword:""});
  const [showPw,setShowPw]=useState(false);
  const [showEditPw,setShowEditPw]=useState(false);
  const [tempPw,setTempPw]=useState("");
  const [saving,setSaving]=useState(false);
  const [editError,setEditError]=useState("");

  async function load(){
    const p=new URLSearchParams({page:String(page),limit:"30"});
    if(search) p.set("search",search);
    if(roleFilter) p.set("role",roleFilter);
    setData(await apiFetch<any>(`/api/admin/users?${p}`));
  }

  useEffect(()=>{load();},[page,roleFilter]);
  useEffect(()=>{const t=setTimeout(()=>{setPage(1);load();},400);return()=>clearTimeout(t);},[search]);

  async function createUser(){
    setSaving(true);
    try{
      const r=await apiFetch<any>("/api/admin/users",{method:"POST",body:JSON.stringify(form)});
      setTempPw(r.temporaryPassword||"");
      setModal("reset");
      setForm({name:"",email:"",role:"dentist",phone:"",gdcNumber:"",password:""});
      load();
    }finally{setSaving(false);}
  }

  async function updateUser(){
    if(!target) return;
    setSaving(true); setEditError("");
    try{
      await apiFetch<any>(`/api/admin/users/${target._id}`,{method:"PATCH",body:JSON.stringify({
        name:editForm.name,
        email:editForm.email,
        role:editForm.role,
        phone:editForm.phone,
        gdcNumber:editForm.gdcNumber,
      })});
      if(editForm.password){
        if(editForm.password.length<6){setEditError("Password must be at least 6 characters");return;}
        if(editForm.password!==editForm.confirmPassword){setEditError("Passwords do not match");return;}
        await apiFetch(`/api/admin/users/${target._id}/set-password`,{method:"POST",body:JSON.stringify({password:editForm.password})});
      }
      setModal(null); setTarget(null); load();
    }catch(err:any){
      setEditError(err.message||"Update failed");
    }finally{setSaving(false);}
  }

  function openEdit(u:any){
    setTarget(u);
    setEditForm({
      name:u.name||"",
      email:u.email||"",
      role:u.role||"dentist",
      phone:u.phone||"",
      gdcNumber:u.gdcNumber||"",
      password:"",
      confirmPassword:"",
    });
    setEditError("");
    setModal("edit");
  }

  async function resetPassword(id:string){
    setSaving(true);
    try{
      const r=await apiFetch<any>(`/api/admin/users/${id}/reset-password`,{method:"POST"});
      setTempPw(r.temporaryPassword||"");
    }finally{setSaving(false);}
  }

  async function toggleActive(u:any){
    await apiFetch(`/api/admin/users/${u._id}`,{method:"PATCH",body:JSON.stringify({active:!u.active})});
    load();
  }

  async function deleteUser(id:string){
    try {
      await apiFetch(`/api/admin/users/${id}`,{method:"DELETE"});
      setModal(null);setTarget(null);load();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  }

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Operations</div>
          <h1 className="text-2xl font-bold text-slate-800">Users & Dentists</h1>
        </div>
        <button onClick={()=>setModal("create")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition-transform"
          style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
          <Plus size={15}/> New User
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-52 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400">
          <Search size={14} className="text-slate-400 shrink-0"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…" className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-400"/>
        </div>
        <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1);}}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400">
          {ROLES.map(r=><option key={r} value={r}>{r||"All Roles"}</option>)}
        </select>
        <span className="text-xs text-slate-400">{data?.total??0} users</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["User","Email","Role","Clinic","GDC#","Status","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!data?(<tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>)
              :data.users.length===0?(<tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No users found</td></tr>)
              :data.users.map((u:any)=>(
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{background:"linear-gradient(135deg,#6366f1,#4f46e5)"}}>
                        {u.name?.charAt(0)||"?"}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_CHIP[u.role]||"bg-slate-100 text-slate-500"}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.clinic?.name||"—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{u.gdcNumber||"—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>toggleActive(u)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors ${u.active?"bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-600":"bg-red-50 text-red-500 hover:bg-emerald-50 hover:text-emerald-600"}`}>
                      {u.active?"Active":"Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>openEdit(u)} title="Edit" className="text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={14}/></button>
                      <button onClick={()=>{setTarget(u);resetPassword(u._id);setModal("reset");}} title="Reset password" className="text-amber-500 hover:text-amber-700 transition-colors"><KeyRound size={14}/></button>
                      <button onClick={()=>{setTarget(u);setModal("delete");}} title="Delete" className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data&&data.pages>1&&(
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="text-xs font-medium text-slate-500 disabled:opacity-40">← Prev</button>
            <span className="text-xs text-slate-400">Page {page} of {data.pages}</span>
            <button onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data.pages} className="text-xs font-medium text-slate-500 disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {modal==="create"&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Create New User</h3>
              <button onClick={()=>setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["GDC Number","gdcNumber","text"]].map(([label,field,type])=>(
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <input type={type} value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400">
                  <option value="dentist">Dentist</option>
                  <option value="lab_staff">Lab Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password (optional)</label>
                <div className="relative">
                  <input type={showPw?"text":"password"} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw?<EyeOff size={13}/>:<Eye size={13}/>}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={createUser} disabled={saving||!form.name||!form.email}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                {saving?"Creating…":"Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {modal==="edit"&&target&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Edit User</h3>
              <button onClick={()=>setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            {editError && <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-medium">{editError}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              {[ ["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["GDC Number","gdcNumber","text"] ].map(([label,field,type])=>{
                const key=field as keyof typeof editForm;
                return (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type={type} value={editForm[key]} onChange={e=>setEditForm(f=>({...f,[field]:e.target.value}))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                  </div>
                );
              })}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select value={editForm.role} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400">
                  <option value="dentist">Dentist</option>
                  <option value="lab_staff">Lab Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-600 mb-2">Change Password (optional)</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input type={showEditPw?"text":"password"} value={editForm.password} onChange={e=>setEditForm(f=>({...f,password:e.target.value}))}
                    placeholder="New password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                  <button type="button" onClick={()=>setShowEditPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showEditPw?<EyeOff size={13}/>:<Eye size={13}/>}
                  </button>
                </div>
                <div>
                  <input type={showEditPw?"text":"password"} value={editForm.confirmPassword} onChange={e=>setEditForm(f=>({...f,confirmPassword:e.target.value}))}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={updateUser} disabled={saving||!editForm.name||!editForm.email}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                {saving?"Saving…":"Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temp password modal */}
      {modal==="reset"&&tempPw&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>{setModal(null);setTempPw("");}}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><KeyRound size={20} className="text-emerald-600"/></div>
            <h3 className="font-bold text-slate-800 mb-2">Temporary Password</h3>
            <p className="text-sm text-slate-500 mb-4">Share this with {target?.name||"the user"} — they should change it on first login.</p>
            <div className="font-mono text-lg font-bold bg-slate-100 rounded-xl px-4 py-3 select-all text-slate-800 mb-4">{tempPw}</div>
            <button onClick={()=>{setModal(null);setTempPw("");}} className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>Done</button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal==="delete"&&target&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-2">Delete User?</h3>
            <p className="text-sm text-slate-500 mb-5">This will permanently delete <strong>{target.name}</strong>. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={()=>deleteUser(target._id)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
