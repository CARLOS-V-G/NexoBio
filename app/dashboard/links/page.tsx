'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, GripVertical, Pencil, Trash2, ExternalLink,
  BarChart2, Sparkles, Link2, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { DbLink } from '@/lib/types';
import { apiPatch, apiPost, apiDelete, getAuthHeaders } from '@/lib/use-api';
import { detectPlatform, getPlatformIconUrl, getPlatformColor } from '@/lib/platforms';
import { PlatformIcon, PlatformBadge } from '@/components/platform-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface SortableLinkProps {
  link: DbLink;
  onEdit: (link: DbLink) => void;
  onDelete: (id: string) => void;
  onToggle: (link: DbLink) => void;
}

function SortableLink({ link, onEdit, onDelete, onToggle }: SortableLinkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 100 : undefined };
  const platform = detectPlatform(link.url);

  return (
    <div ref={setNodeRef} style={style} className={`glass rounded-xl p-3.5 flex items-center gap-3 group transition-all ${isDragging ? 'shadow-2xl ring-1 ring-pink-500/30' : 'hover:border-white/12'}`}>
      <button {...attributes} {...listeners} className="text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
        <GripVertical size={16} />
      </button>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: `${link.color || '#ec4899'}20`, border: `1px solid ${link.color || '#ec4899'}30` }}
      >
        {platform ? (
          <img
            src={getPlatformIconUrl(platform)}
            alt={platform.name}
            className="w-5 h-5 object-contain"
            onError={() => {}}
          />
        ) : link.icon ? (
          <span className="text-lg">{link.icon}</span>
        ) : (
          <ExternalLink size={15} style={{ color: link.color || '#ec4899' }} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-white text-sm truncate">{link.title}</p>
          {platform && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0"
              style={{
                background: `${getPlatformColor(platform)}15`,
                color: getPlatformColor(platform),
                border: `1px solid ${getPlatformColor(platform)}25`,
              }}
            >
              {platform.name}
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-600 truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500 mr-1">
          <BarChart2 size={11} />
          {link.click_count}
        </div>
        <Switch
          checked={link.is_active}
          onCheckedChange={() => onToggle(link)}
          className="data-[state=checked]:bg-pink-500 scale-[0.8]"
        />
        <button onClick={() => onEdit(link)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(link.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

interface LinkForm {
  title: string;
  url: string;
  description: string;
  color: string;
  icon: string;
}

const defaultForm: LinkForm = { title: '', url: '', description: '', color: '#ec4899', icon: '' };

export default function LinksPage() {
  const { profile } = useAuth();
  const [links, setLinks] = useState<DbLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<DbLink | null>(null);
  const [form, setForm] = useState<LinkForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<ReturnType<typeof detectPlatform>>(null);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!profile?.id) return;
    loadLinks();
  }, [profile?.id]);

  const loadLinks = async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('links').select('*').eq('profile_id', profile.id).order('order', { ascending: true });
    setLinks(data ?? []);
    setLoading(false);
  };

  // Detect platform when URL changes
  const handleUrlChange = (url: string) => {
    setForm(f => ({ ...f, url }));
    clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = setTimeout(() => {
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);
      if (platform && !form.title && !editingLink) {
        setForm(f => ({
          ...f,
          url,
          title: f.title || platform.name,
          color: `#${platform.bgColor ?? platform.color}`,
        }));
      } else if (platform) {
        setForm(f => ({ ...f, url, color: `#${platform.bgColor ?? platform.color}` }));
      }
    }, 400);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex(l => l.id === active.id);
    const newIndex = links.findIndex(l => l.id === over.id);
    const newLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(newLinks);
    const headers = await getAuthHeaders();
    fetch('/api/links/reorder', { method: 'POST', headers, body: JSON.stringify({ orderedIds: newLinks.map(l => l.id) }) });
  };

  const openCreate = () => {
    setEditingLink(null);
    setForm(defaultForm);
    setDetectedPlatform(null);
    setDialogOpen(true);
  };

  const openEdit = (link: DbLink) => {
    setEditingLink(link);
    setForm({ title: link.title, url: link.url, description: link.description ?? '', color: link.color ?? '#ec4899', icon: link.icon ?? '' });
    setDetectedPlatform(detectPlatform(link.url));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) { toast.error('Título y URL son requeridos'); return; }
    setSaving(true);
    try {
      if (editingLink) {
        const { ok, data } = await apiPatch('/api/links', { id: editingLink.id, ...form });
        if (!ok) { toast.error(data.error ?? 'Error'); return; }
        setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...l, ...data } : l));
        toast.success('Link actualizado');
      } else {
        const { ok, data } = await apiPost('/api/links', form);
        if (!ok) { toast.error(data.error ?? 'Error'); return; }
        setLinks(prev => [...prev, data]);
        toast.success('Link creado');
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este link?')) return;
    const { ok, data } = await apiDelete(`/api/links?id=${id}`);
    if (!ok) { toast.error(data.error ?? 'Error'); return; }
    setLinks(prev => prev.filter(l => l.id !== id));
    toast.success('Link eliminado');
  };

  const handleToggle = async (link: DbLink) => {
    const { ok, data } = await apiPatch('/api/links', { id: link.id, is_active: !link.is_active });
    if (!ok) { toast.error(data.error ?? 'Error'); return; }
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l));
  };

  const filtered = search
    ? links.filter(l => l.title.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()))
    : links;

  return (
    <div className="p-5 lg:p-7 max-w-2xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Mis Links</h1>
          <p className="text-gray-500 text-sm">{links.length} enlaces · {links.filter(l => l.is_active).length} activos</p>
        </div>
        <Button onClick={openCreate} className="nexo-gradient text-white border-0 hover:opacity-90 gap-1.5 h-9">
          <Plus size={15} />
          Agregar link
        </Button>
      </div>

      {/* Search */}
      {links.length > 3 && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar links..."
            className="pl-9 pr-9 bg-white/5 border-white/8 text-white placeholder:text-gray-600 focus:border-pink-500/50 h-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 && !search ? (
        <div className="text-center py-16 glass rounded-2xl">
          <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
            <Link2 size={24} className="text-gray-500" />
          </div>
          <p className="text-white font-medium mb-1">Sin links todavía</p>
          <p className="text-gray-500 text-sm mb-6">Agrega tu primer link para que aparezca en tu perfil.</p>
          <Button onClick={openCreate} className="nexo-gradient text-white border-0">
            <Plus size={15} className="mr-1.5" />
            Agregar mi primer link
          </Button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-600 mb-2.5 flex items-center gap-1.5">
            <GripVertical size={11} />
            Arrastra para reordenar
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {filtered.map((link) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SortableLink link={link} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
          {search && filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No se encontraron links con "{search}"</p>
          )}
        </>
      )}

      {/* Link dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingLink ? 'Editar link' : 'Nuevo link'}
              {detectedPlatform && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-lg"
                  style={{ background: `${getPlatformColor(detectedPlatform)}15`, color: getPlatformColor(detectedPlatform) }}>
                  {detectedPlatform.name} detectado
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* URL field — first for detection */}
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">URL *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  {detectedPlatform ? (
                    <img src={getPlatformIconUrl(detectedPlatform)} alt="" className="w-4 h-4 object-contain" />
                  ) : (
                    <ExternalLink size={14} className="text-gray-500" />
                  )}
                </div>
                <Input
                  value={form.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 h-10"
                />
              </div>
              {detectedPlatform && (
                <div className="flex items-center gap-2 mt-1.5">
                  <Sparkles size={11} className="text-pink-400" />
                  <p className="text-[11px] text-pink-300">
                    Plataforma detectada: <strong>{detectedPlatform.name}</strong>. Color y nombre aplicados automáticamente.
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Título *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ej: Mi OnlyFans"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 h-10"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Descripción (opcional)</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción corta..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 resize-none h-16 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Color del botón</Label>
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden cursor-pointer border border-white/10">
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ background: form.color }} />
                  </div>
                  <Input
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white focus:border-pink-500 font-mono text-xs h-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Icono emoji</Label>
                <Input
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🔗 ❤️ 🔞"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 h-9 text-center text-lg"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl p-2.5" style={{ background: `${form.color}10`, border: `1px solid ${form.color}30` }}>
              <p className="text-[10px] text-gray-500 mb-1.5">Vista previa</p>
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: `${form.color}15`, border: `1px solid ${form.color}25` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: form.color }}>
                  {detectedPlatform ? (
                    <img src={getPlatformIconUrl(detectedPlatform)} alt="" className="w-4 h-4 object-contain invert" />
                  ) : form.icon ? (
                    <span className="text-sm">{form.icon}</span>
                  ) : (
                    <ExternalLink size={13} className="text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{form.title || 'Título del link'}</p>
                  {form.description && <p className="text-[11px] text-gray-400">{form.description}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-white/10 text-gray-400 hover:bg-white/5 h-9">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 nexo-gradient text-white border-0 hover:opacity-90 h-9">
                {saving ? 'Guardando...' : editingLink ? 'Guardar' : 'Crear link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
