'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SuccessPanel({ reference, onReset }) {
  return (
    <motion.div role="status" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-10 w-10" />
      </motion.span>
      <h3 className="mt-6 text-2xl font-bold">Thank you — we’ve received your enquiry.</h3>
      {reference && reference !== 'ALC-RECEIVED' && (
        <p className="mt-3 text-slate">Your reference number is <strong className="font-mono text-navy-900">{reference}</strong>. Please quote it in any follow-up.</p>
      )}
      <p className="mt-2 text-slate">A member of our team will be in touch shortly.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/products" variant="outline">Browse products</Button>
        {onReset && <Button type="button" onClick={onReset} variant="dark" arrow={false}>Send another</Button>}
      </div>
    </motion.div>
  );
}
