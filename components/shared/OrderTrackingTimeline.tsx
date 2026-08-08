import React from 'react';
import { Check, X, Clock } from 'lucide-react';

export type TrackingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

interface OrderTrackingTimelineProps {
  status: string;
  rejectionReason?: string;
}

export function OrderTrackingTimeline({ status, rejectionReason }: OrderTrackingTimelineProps) {
  const steps = [
    { id: 'PLACED', label: 'ORDER PLACED' },
    { id: 'PENDING', label: 'UNDER REVIEW' },
    { id: 'ACCEPTED', label: 'ACCEPTED' },
    { id: 'COMPLETED', label: 'COMPLETED' }
  ];

  // Map backend status to timeline steps
  let currentStepIndex = 1; // Default: Order Placed (0) and Under Review (1) are active for PENDING
  let isFailed = false;
  let failedStepLabel = '';

  if (status === 'ACCEPTED') {
    currentStepIndex = 2;
  } else if (status === 'COMPLETED') {
    currentStepIndex = 3;
  } else if (status === 'REJECTED') {
    currentStepIndex = 1;
    isFailed = true;
    failedStepLabel = 'ORDER REJECTED';
  } else if (status === 'CANCELLED') {
    currentStepIndex = 1;
    isFailed = true;
    failedStepLabel = 'ORDER CANCELLED';
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {steps.map((step, index) => {
          let state: 'COMPLETED' | 'CURRENT' | 'UPCOMING' = 'UPCOMING';
          
          if (index < currentStepIndex) {
            state = 'COMPLETED';
          } else if (index === currentStepIndex) {
            state = 'CURRENT';
          }

          if (isFailed && index >= currentStepIndex) {
            return null; // Don't render upcoming normal steps if failed
          }

          return (
            <div key={step.id} className="flex gap-4 relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (!isFailed || index < currentStepIndex - 1) && (
                <div className={`absolute left-3 top-8 bottom-[-2rem] w-[2px] ${state === 'COMPLETED' ? 'bg-black' : 'bg-black/20'}`} />
              )}
              
              {/* Icon / Marker */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                {state === 'COMPLETED' && (
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center">
                    <Check className="w-3 h-3 text-black stroke-[3]" />
                  </div>
                )}
                {state === 'CURRENT' && (
                  <div className="w-6 h-6 rounded-full bg-black border-2 border-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
                {state === 'UPCOMING' && (
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-black/30 flex items-center justify-center" />
                )}
              </div>
              
              {/* Label */}
              <div className="flex-1 pb-2">
                <p className={`text-sm font-bold tracking-widest uppercase mt-0.5 ${
                  state === 'UPCOMING' ? 'text-black/40' : 'text-black'
                }`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
        
        {/* Render the failure step explicitly */}
        {isFailed && (
           <div className="flex gap-4 relative">
             <div className="relative z-10 flex-shrink-0 mt-0.5">
               <div className="w-6 h-6 rounded-full bg-white border-2 border-black flex items-center justify-center">
                 <X className="w-3 h-3 text-black stroke-[3]" />
               </div>
             </div>
             <div className="flex-1 pb-2">
               <p className="text-sm font-bold tracking-widest uppercase mt-0.5 text-black">
                 {failedStepLabel}
               </p>
               {rejectionReason && (
                 <div className="mt-4 p-4 border border-black bg-black/5">
                   <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Reason</p>
                   <p className="text-sm font-medium">{rejectionReason}</p>
                 </div>
               )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
