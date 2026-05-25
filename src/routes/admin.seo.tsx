import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Save, ChevronDown, ChevronRight, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/seo")({
  component: AdminSeo,
});

const PAGES = [
  { key:"home", label:"Home" },
  { key:"about", label:"About" },
  { key:"services", label:"Services" },
  { key:"technology", label:"Technology" },
  { key:"workflow", label:"Workflow" },
  { key:"quality", label:"Quality" },
  { key:"contact", label:"Contact" },
  { key:"portal", label:"Portal" },
];

const BLANK_META = { title:"", description:"", keywords:"", ogTitle:"", ogDescription:"", ogImage:"", canonicalUrl:"", noIndex:false };

function AdminSeo() {
  const [existing,setExisting]=useState<Record<string,any>>({});
  const [forms,setForms]=useState<Record<string,any>>({});
  const [expanded,setExpanded]=useState<Set<string>>(new Set(["home"]));
  const [saving,setSaving]=useState<string|null>(null);
  const [saved,setSaved]=useState<string|null>(null);

  useEffect(()=>{
    apiFetch("/api/admin/seo").then((r:any)=>{
      const map:Record<string,any>={};
      r.items.forEach((item:any)=>{ map[item.page]=item; });
      setExisting(map);
    });
  },[]);

  function getForm(page:string){
    if(forms[page]) return forms[page];
    const ex=existing[page];
    return ex ? { title:ex.title||"", description:ex.description||"", keywords:(ex.keywords||[]).join(", "), ogTitle:ex.ogTitle||"", ogDescription:ex.ogDescription||"", ogImage:ex.ogImage||"", canonicalUrl:ex.canonicalUrl||"", noIndex:ex.noIndex||false } : {...BLANK_META};
  }

  function setFormField(page:string,field:string,value:any){
    setForms(f=>({...f,[page]:{...getForm(page),[field]:value}}));
  }

  async function savePage(page:string){
    const f=getForm(page);
    setSaving(page);
    try{
      await apiFetch(`/api/admin/seo/${page}`,{method:"PUT",body:JSON.stringify({...f,keywords:f.keywords.split(",").map((k:string)=>k.trim()).filter(Boolean)})});
      setSaved(page);setTimeout(()=>setSaved(null),2000);
    }finally{setSaving(null);}
  }

  function toggleExpand(p:string){ setExpanded(prev=>{ const n=new Set(prev); if(n.has(p)) n.delete(p); else n.add(p); return n; }); }

  return(
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Content & SEO</div>
        <h1 className="text-2xl font-bold text-slate-800">SEO Manager</h1>
        <p className="text-sm text-slate-400 mt-1">Manage meta titles, descriptions, Open Graph and indexing per page.</p>
      </div>

      <div className="space-y-3">
        {PAGES.map(({key,label})=>{
          const open=expanded.has(key);
          const form=getForm(key);
          const hasData=!!existing[key];
          return(
            <div key={key} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
              <button onClick={()=>toggleExpand(key)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Globe size={14} className="text-indigo-500"/>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 text-sm">{label} Page</div>
                    <div className="text-[11px] text-slate-400">/{key==="home"?"":key}</div>
                  </div>
                  {hasData?(
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold uppercase">Configured</span>
                  ):(
                    <span className="text-[9px] bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full font-semibold uppercase">Not set</span>
                  )}
                </div>
                {open?<ChevronDown size={15} className="text-slate-400"/>:<ChevronRight size={15} className="text-slate-400"/>}
              </button>

              {open&&(
                <div className="border-t border-slate-100 p-5">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Title</label>
                      <input value={form.title} onChange={e=>setFormField(key,"title",e.target.value)}
                        placeholder="e.g. Prime Smile Lab – Premium Dental"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                      <div className="text-[10px] text-slate-400 mt-0.5">{form.title.length}/60 chars</div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Canonical URL</label>
                      <input value={form.canonicalUrl} onChange={e=>setFormField(key,"canonicalUrl",e.target.value)}
                        placeholder="https://primesmilelab.co.uk/..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Meta Description</label>
                      <textarea rows={2} value={form.description} onChange={e=>setFormField(key,"description",e.target.value)}
                        placeholder="Describe this page in 150-160 characters…"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-none"/>
                      <div className="text-[10px] text-slate-400 mt-0.5">{form.description.length}/160 chars</div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Keywords (comma separated)</label>
                      <input value={form.keywords} onChange={e=>setFormField(key,"keywords",e.target.value)}
                        placeholder="dental lab, crowns, veneers, UK…"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <div className="text-xs font-bold text-slate-600 mb-3">Open Graph (Social Preview)</div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">OG Title</label>
                        <input value={form.ogTitle} onChange={e=>setFormField(key,"ogTitle",e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">OG Image URL</label>
                        <input value={form.ogImage} onChange={e=>setFormField(key,"ogImage",e.target.value)}
                          placeholder="https://…"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">OG Description</label>
                        <textarea rows={2} value={form.ogDescription} onChange={e=>setFormField(key,"ogDescription",e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-none"/>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={()=>setFormField(key,"noIndex",!form.noIndex)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${form.noIndex?"bg-red-400":"bg-slate-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.noIndex?"translate-x-4":"translate-x-0.5"}`}/>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">No-index (hide from search engines)</span>
                    </label>
                    <button onClick={()=>savePage(key)} disabled={saving===key}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                      style={saved===key?{background:"#10b981"}:{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                      <Save size={13}/>{saving===key?"Saving…":saved===key?"Saved!":"Save SEO"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
