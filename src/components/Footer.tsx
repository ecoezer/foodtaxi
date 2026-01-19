import React, { useState } from 'react';
import { MapPin, Phone, Heart, X } from 'lucide-react';

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const phoneNumber = '+4915259630500';

  const handleWhatsApp = async (e) => {
    e.preventDefault();
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    
    const whatsappURL = `https://wa.me/${phoneNumber}`;
    
    if (isMobile) {
      try {
        const whatsappWindow = window.open(whatsappURL, '_blank');
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          window.location.href = whatsappURL;
        }
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        window.location.href = whatsappURL;
      }
    } else {
      window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-orange-50 border-t-2 border-orange-400 py-8">
      <div className="container mx-auto px-4 max-w-lg text-center space-y-6">
        
        {/* Address */}
        <div className="bg-white/60 rounded-xl p-4 hover:bg-white/80 transition-colors">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <MapPin className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="font-bold text-gray-800">🏠 LADESTRASSE 3</div>
            <div className="text-sm text-gray-600">📮 31028 GRONAU (LEINE)</div>
            <p className="text-xs text-gray-500">🚗 FoodsTaxi Lieferservice</p>
            <div className="text-xs text-gray-600 bg-yellow-50 rounded-lg p-2 mt-2">
              <strong>Öffnungszeiten:</strong><br />
              Mo: 16:00–21:00<br />
              Mi, Do: 16:00–21:30<br />
              Fr, Sa, So & Feiertage: 12:00–21:30<br />
              Di: Ruhetag
            </div>
          </div>
        </div>

        {/* WhatsApp Button */}
        <div className="relative">
          <a 
            href={`https://wa.me/${phoneNumber}`}
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="p-2 bg-white/20 rounded-full">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium">💬 WhatsApp & Anrufen</div>
              <div className="font-bold text-lg">01525 9630500</div>
            </div>
          </a>
          {copied && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs">
              ✅ Kopyalandı!
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <Heart className="h-4 w-4 text-orange-400" />
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Footer Text */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            © 2025 FoodsTaxi-Gronau 🚕 - Alle Rechte vorbehalten
          </p>
          <button
            onClick={() => setShowImpressum(true)}
            className="text-xs text-orange-600 hover:text-orange-700 underline mt-2 transition-colors"
          >
            Impressum
          </button>
        </div>

        {/* Impressum Modal */}
        {showImpressum && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setShowImpressum(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>

              <div className="p-6 pt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Impressum</h2>

                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h3 className="font-bold text-gray-800">Foods Taxi</h3>
                    <p>Ladestraße 3</p>
                    <p>31028 Gronau (Leine)</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800">Vertretungsberechtigt</h3>
                    <p>Hamid Roshan</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800">Kontakt</h3>
                    <p>Telefon: 01525 9630500</p>
                    <p>E-Mail: roshanhamid38@gmail.com</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800">Umsatzsteueridentifikationsnummer</h3>
                    <p className="text-gray-600">gemäß § 27a Umsatzsteuergesetz: DE457943378</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800">Inhaltlich Verantwortlicher</h3>
                    <p>gemäß § 55 Abs. 2 RStV:</p>
                    <p>Hamid Roshan</p>
                    <p>Ladestraße 3</p>
                    <p>31028 Gronau (Leine)</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowImpressum(false)}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;