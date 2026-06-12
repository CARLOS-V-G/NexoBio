'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Globe, Lock, Eye, MapPin, Server, Wifi,
  AlertTriangle, CheckCircle, Info, ChevronDown, X
} from 'lucide-react';

const countries = [
  { code: 'US', name: 'Estados Unidos', flag: '' },
  { code: 'MX', name: 'Mexico', flag: '' },
  { code: 'ES', name: 'Espana', flag: '' },
  { code: 'AR', name: 'Argentina', flag: '' },
  { code: 'CO', name: 'Colombia', flag: '' },
  { code: 'BR', name: 'Brasil', flag: '' },
  { code: 'DE', name: 'Alemania', flag: '' },
  { code: 'FR', name: 'Francia', flag: '' },
  { code: 'UK', name: 'Reino Unido', flag: '' },
  { code: 'CA', name: 'Canada', flag: '' },
];

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-white/10'
        }`}
      >
        <motion.div
          layout
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md ${enabled ? 'right-1' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

export default function PrivacyPage() {
  const [blockVpn, setBlockVpn] = useState(false);
  const [blockProxy, setBlockProxy] = useState(false);
  const [blockTor, setBlockTor] = useState(false);
  const [countryMode, setCountryMode] = useState<'none' | 'whitelist' | 'blacklist'>('none');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showCountryModal, setShowCountryModal] = useState(false);

  const addCountry = (code: string) => {
    if (!selectedCountries.includes(code)) {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  const removeCountry = (code: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== code));
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Privacidad</h1>
        <p className="text-gray-400 text-sm mt-1">Controla quien puede ver tu perfil</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Proteccion Activada</p>
              <p className="text-gray-500 text-xs">Todos los filtros funcionando</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Globe size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">{selectedCountries.length || 'Todos'} Paises</p>
              <p className="text-gray-500 text-xs">Restricciones geograficas</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-semibold">0 Intentos Bloqueados</p>
              <p className="text-gray-500 text-xs">Ultimas 24 horas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Blocking */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <Server size={18} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Bloqueo de Conexion</h2>
            <p className="text-gray-500 text-sm">Prevenir accesos mediante VPN, Proxy o Tor</p>
          </div>
        </div>

        <div className="space-y-2">
          <ToggleSwitch
            enabled={blockVpn}
            onChange={setBlockVpn}
            label="Bloquear VPN"
            description="Bloquea usuarios conectados mediante redes VPN"
          />
          <ToggleSwitch
            enabled={blockProxy}
            onChange={setBlockProxy}
            label="Bloquear Proxy"
            description="Bloquea usuarios conectados mediante proxies"
          />
          <ToggleSwitch
            enabled={blockTor}
            onChange={setBlockTor}
            label="Bloquear Tor"
            description="Bloquea usuarios de la red Tor"
          />
        </div>

        {(blockVpn || blockProxy || blockTor) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2"
          >
            <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-emerald-400 text-sm">
              {blockVpn && blockProxy && blockTor
                ? 'Proteccion completa activada. Todos los tipos de conexion anonima seran bloqueados.'
                : 'Proteccion parcial activada. Algunos accesos anonimos seran bloqueados.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Country Blocking */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <MapPin size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Restriccion Geografica</h2>
            <p className="text-gray-500 text-sm">Permite o bloquea paises especificos</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setCountryMode('none')}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              countryMode === 'none'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Sin Restriccion
          </button>
          <button
            onClick={() => setCountryMode('whitelist')}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              countryMode === 'whitelist'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Lista Blanca
          </button>
          <button
            onClick={() => setCountryMode('blacklist')}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              countryMode === 'blacklist'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Lista Negra
          </button>
        </div>

        {/* Selected Countries */}
        {countryMode !== 'none' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map((code) => {
                const country = countries.find((c) => c.code === code);
                return (
                  <motion.span
                    key={code}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white"
                  >
                    {country?.name}
                    <button
                      onClick={() => removeCountry(code)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </motion.span>
                );
              })}
            </div>

            <button
              onClick={() => setShowCountryModal(true)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Globe size={16} />
              Agregar Pais
            </button>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-400 text-sm">
                {countryMode === 'whitelist'
                  ? 'Solo los paises en la lista blanca podran acceder a tu perfil.'
                  : 'Los paises en la lista negra no podran acceder a tu perfil.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Lock size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Permisos de Perfil</h2>
            <p className="text-gray-500 text-sm">Controla la visibilidad de tu contenido</p>
          </div>
        </div>

        <div className="space-y-2">
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Perfil Publico"
            description="Cualquiera puede ver tu perfil"
          />
          <ToggleSwitch
            enabled={false}
            onChange={() => {}}
            label="Mostrar Estadisticas"
            description="Muestra contadores en tu perfil publico"
          />
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Permitir Mensajes"
            description="Usuarios pueden enviarte mensajes"
          />
        </div>
      </div>

      {/* Country Selection Modal */}
      {showCountryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCountryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-semibold">Seleccionar Pais</h3>
              <button
                onClick={() => setShowCountryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    addCountry(country.code);
                    setShowCountryModal(false);
                  }}
                  disabled={selectedCountries.includes(country.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    selectedCountries.includes(country.code)
                      ? 'bg-pink-500/10 border border-pink-500/20 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-white/5 text-white'
                  }`}
                >
                  <span className="text-sm">{country.name}</span>
                  {selectedCountries.includes(country.code) && (
                    <CheckCircle size={16} className="ml-auto text-pink-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
