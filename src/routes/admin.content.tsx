import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Save, Trash2, X, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

const PAGES = ["home","about","services","technology","workflow","quality","contact"];
const TYPES = ["text","richtext","image","list","boolean","number"];

function AdminContent() {
  const [items,setItems]=useState<any[]>([]);
  const [activePage,setActivePage]=useState("home");
  const [expandedSections,setExpandedSections]=useState<Set<string>>(new Set());
  const [editing,setEditing]=useState<Record<string,string>>({});
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({page:"home",section:"",key:"",value:"",type:"text"});
  const [saving,setSaving]=useState<string|null>(null);

  async function load(){
    const r=await apiFetch<any>(`/api/admin/content?page=${activePage}`);
    setItems(r.items);
  }
  useEffect(()=>{load();},[activePage]);

  const grouped = items.reduce((acc:any,item:any)=>{
    if(!acc[item.section]) acc[item.section]=[];
    acc[item.section].push(item);
    return acc;
  },{});

  function toggleSection(s:string){ setExpandedSections(prev=>{ const n=new Set(prev); if(n.has(s)) n.delete(s); else n.add(s); return n; }); }

  async function saveItem(item:any,value:string){
    setSaving(item._id);
    try{
      await apiFetch("/api/admin/content",{method:"PUT",body:JSON.stringify({page:item.page,section:item.section,key:item.key,value,type:item.type})});
      setEditing(e=>({...e,[item._id]:undefined as any}));
      load();
    }finally{setSaving(null);}
  }

  async function addItem(){
    setSaving("new");
    try{
      await apiFetch("/api/admin/content",{method:"PUT",body:JSON.stringify(form)});
      setModal(false);setForm({page:"home",section:"",key:"",value:"",type:"text"});
      setActivePage(form.page);load();
    }finally{setSaving(null);}
  }

  async function deleteItem(id:string){
    await apiFetch(`/api/admin/content/${id}`,{method:"DELETE"});
    load();
  }

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Content & SEO</div>
          <h1 className="text-2xl font-bold text-slate-800">Content Keys</h1>
          <p className="text-sm text-slate-400 mt-1">Manage raw key-value content entries used by the site renderer. For visual page layout, use <a href="/admin/pages" className="text-indigo-500 hover:underline font-medium">Page Editor</a>.</p>
        </div>
        <button onClick={()=>setModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
          <Plus size={15}/> Add Content
        </button>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map(p=>(
          <button key={p} onClick={()=>setActivePage(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activePage===p?"text-white shadow-md":"bg-white text-slate-500 hover:text-indigo-600"}`}
            style={activePage===p?{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}:{}}>
            {p}
          </button>
        ))}
      </div>

      {/* Content sections */}
      {Object.keys(grouped).length===0?(
        <div className="bg-white rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="text-slate-400 mb-2">No content entries for <strong>{activePage}</strong></div>
          <button onClick={()=>setModal(true)} className="text-sm text-indigo-500 hover:underline">Add the first entry</button>
        </div>
      ):(
        <div className="space-y-3">
          {Object.entries(grouped).map(([section,sectionItems])=>{
            const open=expandedSections.has(section);
            return(
              <div key={section} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
                <button onClick={()=>toggleSection(section)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-indigo-400 inline-block"/>
                    <span className="font-semibold text-slate-800 capitalize">{section}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{(sectionItems as any[]).length} items</span>
                  </div>
                  {open?<ChevronDown size={15} className="text-slate-400"/>:<ChevronRight size={15} className="text-slate-400"/>}
                </button>
                {open&&(
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {(sectionItems as any[]).map((item:any)=>{
                      const val = editing[item._id]!==undefined ? editing[item._id] : String(item.value);
                      const changed = editing[item._id]!==undefined && editing[item._id]!==String(item.value);
                      return(
                        <div key={item._id} className="px-5 py-4 flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-slate-700 font-mono">{item.key}</span>
                              <span className="text-[9px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded font-medium uppercase">{item.type}</span>
                            </div>
                            {item.type==="richtext"?(
                              <textarea rows={3} value={val} onChange={e=>setEditing(ed=>({...ed,[item._id]:e.target.value}))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-y"/>
                            ):(
                              <input value={val} onChange={e=>setEditing(ed=>({...ed,[item._id]:e.target.value}))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                            )}
                          </div>
                          <div className="flex gap-1.5 pt-6 shrink-0">
                            {changed&&(
                              <button onClick={()=>saveItem(item,val)} disabled={saving===item._id}
                                className="p-1.5 rounded-lg text-white transition-colors" style={{background:"#6366f1"}} title="Save">
                                <Save size={13}/>
                              </button>
                            )}
                            <button onClick={()=>deleteItem(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Add Content Entry</h3>
              <button onClick={()=>setModal(false)}><X size={18} className="text-slate-400"/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Page</label>
                  <select value={form.page} onChange={e=>setForm(f=>({...f,page:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400">
                    {PAGES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400">
                    {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {[["Section","section"],["Key","key"]].map(([label,field])=>(
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <input value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Value</label>
                <textarea rows={3} value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-none"/>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={()=>setModal(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={addItem} disabled={!form.section||!form.key||saving==="new"}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                {saving==="new"?"Adding…":"Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
