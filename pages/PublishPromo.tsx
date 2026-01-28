
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Megaphone, Send, Loader2, Image as ImageIcon, 
  ExternalLink, Type, MousePointer2, Info, Sparkles, CheckCircle2 
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const { useNavigate } = Router as any;

const PublishPromo = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    button_text: 'ŞİMDİ İNCELE',
    button_link: ''
  });

  const [activeStep, setActiveStep] = useState(1);

  const handleForge = async () => {
    if (!formData.title || !formData.content) {
        haptic('rigid');
        alert("Lütfen başlık ve mesaj içeriğini doldurun.");
        return;
    }

    setIsLoading(true);
    haptic('medium');

    try {
        // ID'yi burada oluşturup gönderiyoruz
        const promoId = `U-PROM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        await DatabaseService.savePromotion({
            ...formData,
            id: promoId,
            status: 'pending',
            total_reach: 0,
            channel_count: 0,
            created_at: new Date().toISOString()
        });

        if (user?.id) {
            await DatabaseService.logActivity(
                user.id.toString(),
                'payment',
                'PROMO_SUBMITTED',
                'Reklam Yayına Hazır',
                `'${formData.title}' başlıklı reklamınız onay için sisteme gönderildi.`
            );
        }

        notification('success');
        haptic('heavy');
        
        alert("Reklamınız başarıyla oluşturuldu ve onay için sıraya alındı.");
        navigate('/');
    } catch (e: any) {
        console.error("Publishing Error:", e);
        notification('error');
        // Kullanıcıya daha detaylı bilgi veriyoruz
        alert(`Reklam yayınlanırken bir hata oluştu: ${e.message || "Bilinmeyen Hata"}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-10 pb-40 animate-in fade-in">
        <div className="flex items-center gap-4 mb-10 px-2">
            <button onClick={() => navigate(-1)} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Reklam <span className="text-emerald-500">Forge</span></h1>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 italic">Global Dağıtım Motoru</p>
            </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-10 px-2">
            {[1, 2, 3].map(step => (
                <div 
                    key={step} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${activeStep >= step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-900'}`}
                />
            ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-10">
            {/* Section 1: Content */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"><Type size={16}/></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">İçerik Detayları</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">REKLAM BAŞLIĞI</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={e => { setFormData({...formData, title: e.target.value}); if(e.target.value) setActiveStep(Math.max(activeStep, 1)); }}
                            className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] px-6 text-[11px] font-black text-white outline-none focus:border-emerald-500/30 transition-all uppercase italic tracking-widest shadow-inner" 
                            placeholder="Örn: Hafta Sonu Fırsatı"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                        <textarea 
                            value={formData.content}
                            rows={4}
                            onChange={e => { setFormData({...formData, content: e.target.value}); if(e.target.value) setActiveStep(Math.max(activeStep, 2)); }}
                            className="w-full bg-slate-950 border border-white/5 p-6 rounded-[32px] text-[11px] font-black text-slate-400 outline-none focus:border-emerald-500/30 transition-all uppercase italic tracking-widest shadow-inner resize-none" 
                            placeholder="Kanal üyelerine görünecek mesaj..."
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Action & Media */}
            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500"><MousePointer2 size={16}/></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Buton & Görsel</h3>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BUTON METNİ</label>
                            <input 
                                type="text" 
                                value={formData.button_text}
                                onChange={e => setFormData({...formData, button_text: e.target.value})}
                                className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] px-6 text-[10px] font-black text-white outline-none focus:border-blue-500/30 transition-all uppercase italic shadow-inner" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BUTON LİNKİ</label>
                            <input 
                                type="text" 
                                value={formData.button_link}
                                onChange={e => setFormData({...formData, button_link: e.target.value})}
                                className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] px-6 text-[10px] font-black text-white outline-none focus:border-blue-500/30 transition-all uppercase italic shadow-inner" 
                                placeholder="t.me/..."
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">GÖRSEL URL (OPSİYONEL)</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={formData.image_url}
                                onChange={e => { setFormData({...formData, image_url: e.target.value}); setActiveStep(3); }}
                                className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] pl-14 pr-6 text-[10px] font-black text-white outline-none focus:border-emerald-500/30 transition-all italic shadow-inner" 
                                placeholder="https://..."
                            />
                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Telegram Live Preview */}
            <div className="px-2">
                <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-6 italic">Telegram Önizleme</h3>
                <div className="w-full bg-[#17212b] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 ring-8 ring-white/5">
                    {formData.image_url && (
                        <img 
                            src={formData.image_url} 
                            className="w-full aspect-video object-cover" 
                            onError={(e) => (e.target as any).style.display = 'none'}
                        />
                    )}
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <p className="text-[13px] text-white font-bold leading-tight">{formData.title || 'Reklam Başlığı'}</p>
                            <p className="text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed">{formData.content || 'Reklam içeriği burada görünecek...'}</p>
                        </div>
                        {formData.button_text && (
                            <div className="bg-[#242f3d] py-3 rounded-lg text-center text-blue-400 text-[11px] font-bold border border-white/5 shadow-inner">
                                {formData.button_text}
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-2 bg-black/20 flex justify-end">
                        <span className="text-[9px] text-slate-500 font-black">12:45 PM</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 inset-x-0 p-6 z-[80] bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pb-10">
            <button 
                onClick={handleForge}
                disabled={isLoading || !formData.title || !formData.content}
                className="w-full h-20 bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-700 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border-b-8 border-emerald-800 disabled:border-slate-950"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                        <Sparkles size={18} />
                        FORGE ET VE YAYINLA
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default PublishPromo;
