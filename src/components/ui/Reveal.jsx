'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </Tag>
  );
}

export function Stagger({ children, className = '', stagger = 0.08, as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function StaggerItem({ children, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}
