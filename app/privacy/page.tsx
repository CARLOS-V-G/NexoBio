import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 nexo-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="font-bold text-white">NexoBio</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-3">Política de Privacidad</h1>
        <p className="text-gray-400 mb-10">Última actualización: {new Date().toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Información que recopilamos</h2>
            <p className="mb-3">Recopilamos la siguiente información cuando usas NexoBio:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li><strong className="text-white">Cuenta:</strong> Email, username, nombre público y contraseña (hasheada).</li>
              <li><strong className="text-white">Perfil:</strong> Bio, foto de perfil, portada, enlaces y configuración.</li>
              <li><strong className="text-white">Estadísticas:</strong> Visitas a perfiles y clics en enlaces (con IP hasheada).</li>
              <li><strong className="text-white">Reportes:</strong> Información de reportes enviados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Cómo usamos tu información</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Para proporcionar y mejorar el servicio</li>
              <li>Para generar estadísticas de perfil para el creador</li>
              <li>Para detectar y prevenir actividades fraudulentas</li>
              <li>Para gestionar reportes de contenido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Estadísticas y privacidad</h2>
            <p>Para las estadísticas de visitas, nunca almacenamos tu dirección IP completa. Solo guardamos un hash (huella digital irreversible) que nos permite contar visitas únicas sin identificar a los usuarios.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Compartir información</h2>
            <p className="mb-3">No vendemos tu información personal. Podemos compartir información en los siguientes casos:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Con proveedores de servicios necesarios para operar la plataforma</li>
              <li>Cuando sea requerido por ley o autoridades competentes</li>
              <li>Para proteger los derechos, propiedad o seguridad de NexoBio o sus usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Seguridad</h2>
            <p>Implementamos medidas de seguridad para proteger tu información, incluyendo cifrado de contraseñas, protección HTTPS y controles de acceso. Sin embargo, ningún sistema es 100% seguro.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p>Usamos cookies para mantener tu sesión iniciada y guardar preferencias como la confirmación de edad para perfiles +18. Estas preferencias se guardan en tu navegador (localStorage/cookies) y son necesarias para el funcionamiento del servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Tus derechos</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu cuenta</li>
              <li>Exportar tus datos</li>
            </ul>
            <p className="mt-3">Para ejercer estos derechos, contacta con nuestro equipo de soporte.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Menores de edad</h2>
            <p>NexoBio no está dirigido a menores de 18 años. No recopilamos conscientemente información de menores. Si descubres que un menor ha creado una cuenta, contáctanos inmediatamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Cambios a esta política</h2>
            <p>Podemos actualizar esta política de privacidad. Te notificaremos los cambios importantes a través de tu email registrado.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
          <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
        </div>
        <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} NexoBio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
