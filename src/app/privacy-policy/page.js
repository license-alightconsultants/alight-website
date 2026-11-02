import LegalPage from '@/components/layout/LegalPage';
import { getPage, pageMetadata } from '@/lib/pages';

// Wording is edited in Admin → Pages. It must be reviewed by Alight's legal advisor (docs/CONTENT-VERIFICATION.md).
export const revalidate = 300;
export const generateMetadata = () => pageMetadata('privacy-policy');

export default async function PrivacyPage() {
  return <LegalPage content={await getPage('privacy-policy')} href="/privacy-policy" />;
}
