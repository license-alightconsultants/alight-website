import LegalPage from '@/components/layout/LegalPage';
import { getPage, pageMetadata } from '@/lib/pages';

// Wording is edited in Admin → Pages. It must be reviewed by Alight's legal advisor (docs/CONTENT-VERIFICATION.md).
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('terms-and-conditions');

export default async function TermsPage() {
  return <LegalPage content={await getPage('terms-and-conditions')} href="/terms-and-conditions" />;
}
