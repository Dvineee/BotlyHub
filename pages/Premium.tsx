
import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionPlans } from '../data';

const Premium = () => {
  const navigate = useNavigate();

  // Get current plan from local storage (mock)
  const currentPlanId = localStorage.getItem('userPlan') || 'plan_starter';

  const handleSelectPlan = (planId: string) => {
    if (planId === currentPlanId) return;
    
    // If free plan, just set it
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan && plan.price === 0) {
        localStorage.setItem('userPlan', planId);
        navigate('/settings'); // Go back to profile
    } else {
        // Go to payment for paid plans
        navigate(`/payment/${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pt-10 pb-32 animate-in fade-in transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-5 mb-10 px-1">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Premium Paketler</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Üyelik Yönetimi</p>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-12 px-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Limitleri <span className="text-brand dark:text-brand-light">Kaldırın</span>
          </h2>
          <p className="text-slate-500 text-xs mt-3 max-w-xs mx-auto font-medium leading-relaxed">
              Daha düşük komisyon oranları ve özel özelliklerle gelirinizi artırın.
          </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {subscriptionPlans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              const Icon = plan.icon;

              // Color mapping for dynamic styles
              let borderColor = 'border-black/5 dark:border-white/5';
              let shadowColor = 'shadow-xl';
              let btnColor = 'bg-slate-900 dark:bg-slate-800 text-white';
              let iconColor = 'text-slate-500 dark:text-slate-400';
              
              if (plan.color === 'blue') {
                  borderColor = 'border-brand/20 dark:border-brand-light/20';
                  shadowColor = 'shadow-xl shadow-brand/10';
                  btnColor = 'bg-brand dark:bg-brand-light hover:opacity-90 text-white';
                  iconColor = 'text-brand dark:text-brand-light';
              } else if (plan.color === 'yellow') {
                  borderColor = 'border-yellow-500/30';
                  shadowColor = 'shadow-xl shadow-yellow-900/10';
                  btnColor = 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white';
                  iconColor = 'text-yellow-600 dark:text-yellow-400';
              }

              return (
                  <div 
                    key={plan.id} 
                    className={`relative flex flex-col bg-white dark:bg-slate-900/40 rounded-[32px] p-8 border ${borderColor} ${shadowColor} transition-all duration-300 ${plan.isPopular ? 'md:scale-[1.05] z-10 bg-white dark:bg-slate-900/60' : ''}`}
                  >
                      {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand dark:bg-brand-light text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider">
                              EN POPÜLER
                          </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner ${iconColor}`}>
                              <Icon size={28} />
                          </div>
                          <div className="text-right">
                              <div className="flex items-end justify-end gap-1">
                                  <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">₺{plan.price}</span>
                                  <span className="text-xs text-slate-500 mb-1.5 font-bold">/ay</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{plan.billingPeriod} faturalandırılır</p>
                          </div>
                      </div>

                      <h3 className={`text-xl font-bold mb-2 tracking-tight ${plan.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-900 dark:text-white'}`}>
                          {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-8 min-h-[40px] font-medium leading-relaxed">
                          {plan.description}
                      </p>

                      <div className="space-y-4 mb-10">
                          {plan.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' : 'bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light'}`}>
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                  <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                              </div>
                          ))}
                      </div>

                      <div className="mt-auto">
                        <button 
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={isCurrent}
                          className={`w-full py-4 md:py-5 lg:py-6 rounded-2xl font-bold text-[10px] md:text-xs lg:text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                              isCurrent 
                              ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-default border border-black/5 dark:border-white/5' 
                              : btnColor
                          }`}
                        >
                            {isCurrent ? 'Mevcut Plan' : (plan.price === 0 ? 'Ücretsiz Başla' : 'Planı Seç')}
                        </button>
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
};

export default Premium;
