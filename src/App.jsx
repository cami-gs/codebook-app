import React, { useMemo, useState } from "react";
import codebook from "./codebook.json";

import {
  Search,
  ChevronRight,
  BookOpen,
  Info,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  StickyNote,
  ArrowRightLeft,
  Database,
  Tag,
  Layers,
} from "lucide-react";

// ===== Dataset seguro (si el JSON falla, no crashea) =====
const MACROS = codebook?.macros ?? [];
const CODES_RAW = codebook?.codes ?? [];
const ITEMS_RAW = codebook?.items ?? [];

// ===== Helpers =====
const truncate = (s = "", n = 220) => (s.length > n ? s.slice(0, n) + "…" : s);

const ItemTag = ({ type }) => {
  const config = {
    definition: { label: "Definición", cls: "bg-blue-100 text-blue-700", icon: <FileText size={12} /> },
    inclusion: { label: "Inclusión", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={12} /> },
    exclusion: { label: "Exclusión", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={12} /> },
    example: { label: "Ejemplo", cls: "bg-amber-100 text-amber-700", icon: <MessageSquare size={12} /> },
    border_rule: { label: "Regla", cls: "bg-purple-100 text-purple-700", icon: <ArrowRightLeft size={12} /> },
    analytic_note: { label: "Nota", cls: "bg-slate-100 text-slate-700", icon: <StickyNote size={12} /> },
  };
  const c = config[type] || config.definition;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

const ItemCard = ({ type, text }) => {
  const config = {
    definition: { label: "Definición", color: "bg-blue-50 border-blue-100 text-blue-900", icon: <FileText size={14} /> },
    inclusion: { label: "Inclusión", color: "bg-emerald-50 border-emerald-100 text-emerald-900", icon: <CheckCircle2 size={14} /> },
    exclusion: { label: "Exclusión", color: "bg-rose-50 border-rose-100 text-rose-900", icon: <XCircle size={14} /> },
    example: { label: "Ejemplo", color: "bg-amber-50 border-amber-100 text-amber-900", icon: <MessageSquare size={14} /> },
    border_rule: { label: "Regla de Borde", color: "bg-purple-50 border-purple-100 text-purple-900", icon: <ArrowRightLeft size={14} /> },
    analytic_note: { label: "Nota Analítica", color: "bg-slate-50 border-slate-100 text-slate-900", icon: <StickyNote size={14} /> },
  };
  const c = config[type] || config.definition;

  return (
    <div className={`p-6 rounded-[2rem] border ${c.color} shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="p-2 bg-white/60 rounded-xl shadow-inner">{c.icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{c.label}</span>
      </div>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium text-slate-700">{text}</p>
    </div>
  );
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMacroId, setSelectedMacroId] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);

  const getMacroById = (id) => MACROS.find((m) => m.id === id);

  // Index items por code_id (más rápido y ordenado por `order`)
  const itemsByCode = useMemo(() => {
    const map = new Map();
    for (const it of ITEMS_RAW) {
      if (!map.has(it.code_id)) map.set(it.code_id, []);
      map.get(it.code_id).push(it);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      map.set(k, arr);
    }
    return map;
  }, []);

  const getItemsForCode = (codeId) => itemsByCode.get(codeId) ?? [];

  const filteredCodes = useMemo(() => {
    let base = Array.isArray(CODES_RAW) ? CODES_RAW : [];
    if (selectedMacroId) base = base.filter((c) => c.macro_id === selectedMacroId);

    if (searchTerm.trim()) {
      const low = searchTerm.toLowerCase();
      base = base.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const key = (c.key || "").toLowerCase();
        return name.includes(low) || key.includes(low);
      });
    }
    return base;
  }, [searchTerm, selectedMacroId]);

  // Si no carga el JSON, muestra algo (en vez de blanco)
  if (!MACROS.length || !CODES_RAW.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6">
          <h1 className="text-lg font-bold mb-2">No se pudo cargar el codebook</h1>
          <p className="text-sm text-slate-600">
            Revisa que <span className="font-mono">src/codebook.json</span> exista y tenga{" "}
            <span className="font-mono">macros</span>, <span className="font-mono">codes</span>,{" "}
            <span className="font-mono">items</span>.
          </p>
        </div>
      </div>
    );
  }

  const title = selectedMacroId ? (getMacroById(selectedMacroId)?.name ?? "Macro no encontrada") : "Explorador Normativo";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-200">
      {/* HEADER */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl rotate-3">
              <Layers className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Manual Maestro de Codificación</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base Normalizada • V1</p>
              </div>
            </div>
          </div>

          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar códigos o claves..."
              className="w-full pl-12 pr-6 py-4 bg-slate-100 border-2 border-transparent rounded-[1.8rem] text-sm focus:bg-white focus:ring-8 focus:ring-slate-900/5 focus:border-slate-300 outline-none transition-all placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MACROS */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="sticky top-32">
            <div className="flex items-center gap-3 mb-6 px-3">
              <Database size={16} className="text-indigo-500" />
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Macro Categorías</h3>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedMacroId(null)}
                className={`text-left px-5 py-4 rounded-[1.5rem] text-[13px] font-bold transition-all ${
                  !selectedMacroId ? "bg-slate-900 text-white shadow-xl translate-x-1" : "text-slate-500 hover:bg-slate-200"
                }`}
              >
                Todas las Áreas
              </button>

              {MACROS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMacroId(m.id)}
                  className={`group flex items-center justify-between text-left px-5 py-4 rounded-[1.5rem] text-[13px] transition-all border-l-4 ${
                    selectedMacroId === m.id
                      ? "bg-white shadow-lg border-indigo-600 text-slate-900 font-black"
                      : "border-transparent text-slate-500 hover:bg-white"
                  }`}
                >
                  <span className="truncate">{m.name}</span>
                  <ChevronRight size={14} className={selectedMacroId === m.id ? "opacity-100 text-indigo-500" : "opacity-0 group-hover:opacity-40"} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CÓDIGOS */}
        <section className="lg:col-span-9">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{title}</h2>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-indigo-100 rounded-full">
                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{filteredCodes.length} Entidades</p>
              </div>
              <span className="text-slate-300">•</span>
              <p className="text-slate-400 text-xs font-medium italic">Mostrando registros del codebook</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCodes.map((code) => {
              const items = getItemsForCode(code.id);
              const def = items.find((i) => i.type === "definition")?.text || "Sin definición cargada.";
              const rule = items.find((i) => i.type === "border_rule")?.text || "";

              return (
                <div
                  key={code.id}
                  onClick={() => setSelectedCode(code)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-400 hover:shadow-2xl transition-all cursor-pointer group active:scale-95 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <BookOpen size={16} />
                    </div>
                  </div>

                  <div className="mb-6 flex items-center gap-2">
                    <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-2.5 py-1 rounded-lg border border-slate-100">
                      ID:{code.id}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-700 leading-tight mb-4">{code.name}</h4>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-black text-slate-700">Def:</span> {truncate(def, 180)}
                    </p>
                    {rule && (
                      <p className="text-[11px] text-slate-500 leading-snug">
                        <span className="font-bold text-slate-600">Regla:</span> {truncate(rule, 140)}
                      </p>
                    )}
                  </div>

                  <code className="mt-4 inline-block text-[10px] font-mono font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-md group-hover:text-indigo-400 transition-colors">
                    {code.key}
                  </code>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* MODAL DETALLE (con scroll real) */}
      {selectedCode && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="bg-white w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] min-h-0 border border-slate-100">
              {/* Header fijo */}
              <div className="p-10 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
                <div className="flex items-start gap-6">
                  <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 shrink-0 -rotate-3">
                    <Tag size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{selectedCode.name}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-slate-100 px-4 py-2 rounded-xl text-[11px] font-mono font-black text-slate-500 uppercase tracking-tighter">
                        KEY: {selectedCode.key}
                      </span>
                      <div className="h-4 w-px bg-slate-200" />
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                        {getMacroById(selectedCode.macro_id)?.name ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setSelectedCode(null)} className="p-4 hover:bg-slate-100 rounded-full transition-all text-slate-300 hover:text-slate-900">
                  <X size={28} />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="p-10 overflow-y-auto bg-[#FCFCFD] flex-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                  <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">UID</p>
                    <p className="text-2xl font-black text-slate-900">#{selectedCode.id}</p>
                  </div>
                  <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm md:col-span-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Codebook</p>
                    <p className="text-sm font-bold text-slate-600 truncate">codebook.json</p>
                  </div>
                  <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-100">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Status</p>
                    <p className="text-sm font-black text-white">OK</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.35em]">Ítems del código</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getItemsForCode(selectedCode.id).map((item, idx) => (
                    <ItemCard key={idx} type={item.type} text={item.text} />
                  ))}
                </div>
              </div>

              {/* Footer fijo */}
              <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin del registro</p>
                </div>
                <p className="text-[10px] font-bold text-slate-300">© Codebook</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
