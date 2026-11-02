import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number');

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(''));

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  company: optionalText(150),
  email: z.string().trim().email('Enter a valid email').max(150),
  mobile: phone,
  service: optionalText(120),
  product: optionalText(150),
  subject: z.string().trim().min(3, 'Please add a subject').max(200),
  message: z.string().trim().min(10, 'Tell us a little more (min 10 characters)').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept to continue' }) }),
  sourcePage: optionalText(300),
  website: z.string().max(200).optional(), // honeypot, checked in the route handler
  startedAt: z.number().optional(),
});

export const consultationSteps = [
  { id: 'contact', title: 'Contact', fields: ['name', 'email', 'mobile'] },
  { id: 'company', title: 'Company', fields: ['company', 'designation', 'companySize', 'industry'] },
  { id: 'service', title: 'Service', fields: ['service'] },
  { id: 'requirements', title: 'Requirements', fields: ['message'] },
  { id: 'budget', title: 'Budget & timeline', fields: ['budget', 'timeline'] },
  { id: 'review', title: 'Review', fields: ['consent'] },
];

export const consultationSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Enter a valid email').max(150),
  mobile: phone,
  company: z.string().trim().min(2, 'Company name is required').max(150),
  designation: optionalText(100),
  companySize: optionalText(40),
  industry: optionalText(80),
  service: z.string().trim().min(2, 'Select a service'),
  product: optionalText(150),
  message: z.string().trim().min(20, 'Describe your requirements (min 20 characters)').max(5000),
  budget: optionalText(60),
  timeline: optionalText(60),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept to continue' }) }),
  sourcePage: optionalText(300),
  website: z.string().max(200).optional(),
  startedAt: z.number().optional(),
});

export function fieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0];
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
