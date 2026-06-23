import { useState } from 'react';
import { X, Paperclip, MoreVertical, Sparkles, ChevronDown, Send, RefreshCw } from 'lucide-react';
import { api, Employee } from '../../lib/api';
import { toast } from 'sonner';

interface SendBirthdayEmailModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendBirthdayEmailModal({ employee, onClose, onSuccess }: SendBirthdayEmailModalProps) {
  const [emailTo, setEmailTo] = useState(employee.private_email || employee.work_email || '');
  const [subject, setSubject] = useState(`¡Feliz Cumpleaños ${employee.full_name}! 🥳`);
   const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    const toastId = toast.loading('Generando felicitación personalizada con IA...');
    try {
      const response = await api.generateBirthdayMessage({
        full_name: employee.full_name,
        position: employee.position || '',
        department: employee.department || employee.area_name || '',
        zodiac_sign: employee.zodiac_sign || ''
      });

      if (response.subject) setSubject(response.subject);
      if (response.headerText) setHeaderText(response.headerText);
      if (response.bodyText1) setBodyText1(response.bodyText1);
      if (response.bodyText2) setBodyText2(response.bodyText2);

      toast.success('¡Felicitación generada con éxito!', { id: toastId });
    } catch (error: any) {
      console.error('Error generating birthday message with IA:', error);
      toast.error(error.message || 'Error al generar el mensaje con IA. Configure su API Key en Ajustes.', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // Editable text states
  const [headerText, setHeaderText] = useState('¡Feliz Cumpleaños! 🎂');
  const [bodyText1, setBodyText1] = useState(
    'En este día tan especial, todo el equipo quiere mandarte un gran abrazo y desearte lo mejor. Esperamos que pases un día increíble rodeado de tus seres queridos y que este nuevo año de vida venga cargado de éxitos, salud y mucha felicidad.'
  );
  const [bodyText2, setBodyText2] = useState('¡Gracias por todo tu esfuerzo y dedicación!');
  const [footerText, setFooterText] = useState('Con cariño,\nEl equipo de Recursos Humanos');

  // Attached images state
  const [attachedImages, setAttachedImages] = useState<{ name: string; base64: string; type: string }[]>([]);

  // HTML email body that matches the Odoo mail template
  const getEmailHtml = (
    name: string,
    header: string,
    body1: string,
    body2: string,
    footer: string,
    images: { base64: string }[]
  ) => {
    const formattedFooter = footer.replace(/\n/g, '<br/>');
    
    let imagesHtml = '';
    if (images.length > 0) {
      imagesHtml = `
        <div style="margin-top: 30px; text-align: center;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                ${images.map(img => `
                  <div style="margin: 15px auto; max-width: 100%; text-align: center;">
                    <img src="${img.base64}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" />
                  </div>
                `).join('')}
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    return `
<div style="margin: 0px; padding: 0px; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f8f9fa;">
        <tbody>
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
                        
                        <!-- Header / Banner -->
                        <tr>
                            <td align="center" style="background-color: #714B67; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${header}</h1>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px;">
                                <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333;">
                                    Hola <strong>${name}</strong>,
                                </p>
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #555555; line-height: 1.6; white-space: pre-line;">
                                    ${body1}
                                </p>
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #555555; line-height: 1.6; white-space: pre-line;">
                                    ${body2}
                                </p>
                                
                                ${imagesHtml}
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px 40px 40px; text-align: center;">
                                <p style="margin: 0; font-size: 14px; color: #999999; line-height: 1.5;">
                                    ${formattedFooter}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</div>
    `.trim();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedImages(prev => [...prev, {
          name: file.name,
          base64: base64,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!emailTo) {
      toast.error('El destinatario es requerido');
      return;
    }
    if (!subject) {
      toast.error('El asunto es requerido');
      return;
    }

    setSending(true);
    try {
      const bodyHtml = getEmailHtml(
        employee.full_name,
        headerText,
        bodyText1,
        bodyText2,
        footerText,
        attachedImages
      );
      
      const backendAttachments = attachedImages.map(img => {
        const base64Data = img.base64.split(',')[1];
        return {
          filename: img.name,
          content: base64Data,
          encoding: 'base64',
          contentType: img.type
        };
      });

      await api.sendBirthdayEmail({
        email_to: emailTo,
        subject: subject,
        body_html: bodyHtml,
        attachments: backendAttachments
      });
      toast.success('¡Felicitación enviada con éxito!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Error al enviar la felicitación');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Enviar Felicitación de Cumpleaños</h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-400 w-14 uppercase tracking-wider">Para</span>
              <input 
                type="text" 
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="Agregue contactos por notificar..."
                className="flex-1 text-slate-800 font-medium focus:outline-none placeholder-slate-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-400 w-14 uppercase tracking-wider">Asunto</span>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 text-slate-800 font-semibold focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Styled Live Email Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-2xl mx-auto">
              
              {/* Purple/Plum Banner */}
              <div className="bg-[#714B67] text-white py-6 px-4 text-center flex justify-center items-center">
                <input 
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="bg-transparent text-white text-xl font-bold tracking-tight text-center w-full focus:outline-none focus:ring-1 focus:ring-white/30 rounded-lg py-1 px-2 border border-transparent hover:border-white/10"
                />
              </div>

              {/* Message Body */}
              <div className="p-6 space-y-4 text-slate-700 font-medium text-sm">
                <p>
                  Hola <span className="font-semibold text-slate-800 border-b-2 border-dashed border-[#714B67] pb-0.5">{employee.full_name}</span>,
                </p>
                
                <textarea
                  value={bodyText1}
                  onChange={(e) => setBodyText1(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border border-dashed border-[#714B67]/10 hover:border-[#714B67]/30 focus:border-[#714B67]/50 rounded-lg p-2 text-slate-700 font-medium leading-relaxed focus:outline-none resize-none focus:ring-0 text-sm"
                  placeholder="Escribe el cuerpo del mensaje aquí..."
                />
                
                <textarea
                  value={bodyText2}
                  onChange={(e) => setBodyText2(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border border-dashed border-[#714B67]/10 hover:border-[#714B67]/30 focus:border-[#714B67]/50 rounded-lg p-2 text-slate-700 font-medium leading-relaxed focus:outline-none resize-none focus:ring-0 text-sm"
                  placeholder="Escribe un cierre..."
                />

                {/* Attached Images Grid */}
                {attachedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-1 pb-3">
                    {attachedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-100 shadow-sm aspect-video bg-slate-50">
                        <img src={img.base64} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition-all active:scale-90"
                          title="Eliminar imagen"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-center pt-4 border-t border-slate-50 text-slate-400 text-xs">
                  <textarea
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border border-dashed border-[#714B67]/10 hover:border-[#714B67]/30 focus:border-[#714B67]/50 rounded-lg p-1.5 text-slate-500 font-medium text-center focus:outline-none resize-none focus:ring-0 text-xs"
                    placeholder="Firma o remitente..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attached Files List */}
          {attachedImages.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-1.5 text-xs font-semibold text-slate-600">
              <span className="w-full text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">Archivos Adjuntos ({attachedImages.length})</span>
              {attachedImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                  <span className="truncate max-w-[150px]">{img.name}</span>
                  <button 
                    onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex gap-3">
            <div className="flex shadow-sm rounded-lg overflow-hidden border border-[#714B67]/20">
              <button
                onClick={handleSend}
                disabled={sending}
                className="bg-[#714B67] hover:bg-[#603e57] text-white px-5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-70"
              >
                {sending ? 'Enviando...' : 'Enviar'}
                {!sending && <Send size={12} />}
              </button>
              <button 
                disabled={sending}
                className="bg-[#714B67] hover:bg-[#603e57] border-l border-white/10 text-white px-2 flex items-center justify-center transition-all"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <button
              onClick={onClose}
              disabled={sending}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
            >
              Descartar
            </button>
          </div>

          <div className="flex gap-3 text-slate-400">
            <input
              type="file"
              id="image-attach-input"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <button 
              onClick={() => document.getElementById('image-attach-input')?.click()}
              className="p-1.5 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Adjuntar imágenes"
            >
              <Paperclip size={16} />
            </button>
            <button className="p-1.5 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <MoreVertical size={16} />
            </button>
            <button 
              type="button"
              onClick={handleGenerateWithAI}
              disabled={generating || sending}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:text-slate-700 hover:bg-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw size={12} className="animate-spin text-indigo-500" />
              ) : (
                <Sparkles size={12} className="text-amber-500 animate-pulse" />
              )}
              <span>{generating ? 'Generando...' : 'IA'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
