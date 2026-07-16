import { MessageCircle, Phone, Send } from 'lucide-react';
import { company } from '../data/initialData';

export default function FloatingContact() {
  return (
    <div className="floating-contact" aria-label="Quick contact buttons">
      <a href={company.zaloUrl} target="_blank" rel="noreferrer" className="float-btn zalo">Zalo</a>
      <a href={company.whatsappUrl} target="_blank" rel="noreferrer" className="float-btn whatsapp"><MessageCircle size={18} /> WhatsApp</a>
      <a href={company.messengerUrl} target="_blank" rel="noreferrer" className="float-btn messenger"><Send size={18} /> Messenger</a>
      <a href={`tel:${company.hotline}`} className="float-btn call"><Phone size={18} /> Call</a>
    </div>
  );
}
