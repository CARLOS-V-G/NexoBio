import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-3">Términos de Servicio</h1>
        <p className="text-gray-400 mb-10">Última actualización: {new Date().toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de términos</h2>
            <p>Al registrarte y usar NexoBio, aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses la plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Uso permitido</h2>
            <p className="mb-3">NexoBio es una plataforma para que los creadores de contenido compartan sus enlaces. Puedes usar NexoBio para:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Crear tu página pública con enlaces</li>
              <li>Compartir contenido legal de adultos (mayores de 18 años)</li>
              <li>Promover tu contenido en otras plataformas</li>
            </ul>
          </section>

          <section className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
            <h2 className="text-xl font-semibold text-white mb-3">3. Contenido prohibido</h2>
            <p className="mb-3 text-red-300 font-medium">Está estrictamente prohibido:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Menores de edad:</strong> Prohibido cualquier contenido sexual o sugestivo que involucre a menores de 18 años.</li>
              <li><strong className="text-white">Contenido ilegal:</strong> Material que viole las leyes locales, nacionales o internacionales.</li>
              <li><strong className="text-white">Contenido no consentido:</strong> Imágenes o videos íntimos de personas sin su consentimiento.</li>
              <li><strong className="text-white">Explotación o abuso:</strong> Cualquier contenido que promueva, glorifique o facilite la explotación o el abuso de personas.</li>
              <li><strong className="text-white">Spam y fraude:</strong> Engaño, phishing o actividades fraudulentas.</li>
              <li><strong className="text-white">URLs maliciosas:</strong> Links que dirijan a malware, phishing o contenido dañino.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Contenido para adultos (+18)</h2>
            <p className="mb-3">NexoBio permite a creadores adultos marcar su perfil como contenido +18. Los usuarios que activen esta opción:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4">
              <li>Confirman ser mayores de 18 años</li>
              <li>Son responsables de garantizar que su contenido sea legal</li>
              <li>Deben cumplir con las leyes de verificación de edad de su jurisdicción</li>
            </ul>
            <p className="mt-3">Los visitantes de perfiles +18 deben confirmar su mayoría de edad antes de acceder. NexoBio no muestra desnudez explícita en avatares o imágenes de portada públicas.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Responsabilidad del creador</h2>
            <p>Cada creador es el único responsable del contenido que enlaza desde su perfil NexoBio. La plataforma actúa como intermediario y no puede controlar el contenido de sitios externos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Suspensión de cuentas</h2>
            <p>NexoBio se reserva el derecho de suspender o eliminar cualquier cuenta que viole estos términos, sin previo aviso. Las cuentas reportadas por contenido ilegal serán suspendidas inmediatamente mientras se investiga.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitación de responsabilidad</h2>
            <p>NexoBio no se hace responsable por el contenido externo al que enlacen los perfiles de sus usuarios. Proporcionamos la plataforma "tal cual" y no garantizamos disponibilidad continua.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contacto</h2>
            <p>Para reportar violaciones o consultas legales, usa el sistema de reportes en cada perfil o contáctanos directamente.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
        </div>
        <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} NexoBio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
