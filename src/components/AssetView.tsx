import React, { useState } from 'react';
import { Server, Plus, Search, Shield, Trash2, Edit2, X, Database, HardDrive, Cloud, User, Building } from 'lucide-react';
import { ISMSAsset, AssetCategory, ProtectionLevel } from '../types/isms';
import { getProtectionLevelColor, nextSequentialId } from '../utils/ismsUtils';

interface AssetViewProps {
  assets: ISMSAsset[];
  onAddAsset: (asset: ISMSAsset) => void;
  onUpdateAsset: (id: string, updates: Partial<ISMSAsset>) => void;
  onDeleteAsset: (id: string) => void;
}

export const AssetView: React.FC<AssetViewProps> = ({
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: AssetCategory;
    owner: string;
    confidentialityReq: ProtectionLevel;
    integrityReq: ProtectionLevel;
    availabilityReq: ProtectionLevel;
    location: string;
    description: string;
  }>({
    name: '',
    category: 'Cloud',
    owner: '',
    confidentialityReq: 'Hoch',
    integrityReq: 'Hoch',
    availabilityReq: 'Hoch',
    location: 'AWS eu-central-1',
    description: '',
  });

  const filteredAssets = assets.filter((a) => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case 'Cloud':
        return <Cloud className="w-4 h-4 text-sky-400" />;
      case 'Data':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'Hardware':
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'Software':
        return <Server className="w-4 h-4 text-purple-400" />;
      case 'Premises':
        return <Building className="w-4 h-4 text-rose-400" />;
      case 'Personnel':
        return <User className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newAsset: ISMSAsset = {
      id: nextSequentialId(assets.map((a) => a.id), 'AST-'),
      ...formData,
    };
    onAddAsset(newAsset);
    setIsAdding(false);
    setFormData({
      name: '',
      category: 'Cloud',
      owner: '',
      confidentialityReq: 'Hoch',
      integrityReq: 'Hoch',
      availabilityReq: 'Hoch',
      location: 'AWS eu-central-1',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>ISO/IEC 27001 Anhang A.5.9 & BSI IT-Grundschutz</span>
            <span aria-hidden="true">·</span>
            <span>Informationswerte</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Asset-Inventar & Schutzbedarfsanalyse (CIA)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Katalogisierung aller Primär- und Sekundärwerte mit Klassifizierung nach Vertraulichkeit, Integrität und Verfügbarkeit.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Neuen Asset erfassen
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Asset nach Name, ID, Standort oder Owner filtern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto w-full sm:w-auto">
          {['all', 'Cloud', 'Data', 'Hardware', 'Software', 'Premises'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'Alle Kategorien' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(asset.category)}
                  <span className="font-mono text-xs font-bold text-blue-400">{asset.id}</span>
                </div>
                <button
                  onClick={() => onDeleteAsset(asset.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Asset löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white leading-snug">{asset.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              {/* CIA Ratings */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Vertraulichkeit</span>
                  <span className={`font-semibold text-xs ${getProtectionLevelColor(asset.confidentialityReq)}`}>
                    {asset.confidentialityReq}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Integrität</span>
                  <span className={`font-semibold text-xs ${getProtectionLevelColor(asset.integrityReq)}`}>
                    {asset.integrityReq}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Verfügbarkeit</span>
                  <span className={`font-semibold text-xs ${getProtectionLevelColor(asset.availabilityReq)}`}>
                    {asset.availabilityReq}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[140px]">Eigentümer: <strong className="text-slate-300 font-normal">{asset.owner}</strong></span>
              <span className="font-mono text-[11px] text-slate-500">{asset.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Neuen Asset erfassen</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Bezeichnung des Werts</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Kubernetes EKS Produktiv-Cluster"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Kategorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cloud">Cloud-Dienst</option>
                    <option value="Data">Daten / Datenbank</option>
                    <option value="Hardware">Hardware / Geräte</option>
                    <option value="Software">Software / Apps</option>
                    <option value="Premises">Standort / Räumlichkeiten</option>
                    <option value="Personnel">Personal / Rollen</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Verantwortlicher (Asset Owner)</label>
                  <input
                    required
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="z.B. Cloud Architect Lead"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Vertraulichkeit (C)</label>
                  <select
                    value={formData.confidentialityReq}
                    onChange={(e) => setFormData({ ...formData, confidentialityReq: e.target.value as ProtectionLevel })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Sehr Hoch">Sehr Hoch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Integrität (I)</label>
                  <select
                    value={formData.integrityReq}
                    onChange={(e) => setFormData({ ...formData, integrityReq: e.target.value as ProtectionLevel })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Sehr Hoch">Sehr Hoch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Verfügbarkeit (A)</label>
                  <select
                    value={formData.availabilityReq}
                    onChange={(e) => setFormData({ ...formData, availabilityReq: e.target.value as ProtectionLevel })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Sehr Hoch">Sehr Hoch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Standort / Speicherort</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="z.B. AWS eu-central-1 Frankfurt"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Beschreibung & Verwendungszweck</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Zweck, gespeicherte Datenarten, Schnittstellen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  Asset anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
