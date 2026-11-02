import { notFound } from 'next/navigation';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { requirePage } from '@/lib/auth';
import { PAGE_MAP } from '@/lib/pages/registry';
import { getPageValues, getStoredPage } from '@/lib/pages';
import { resetPageAction, savePageAction } from '@/lib/admin/page-actions';
import { ConfirmButton } from '@/components/admin/FormBits';
import { PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';
import PageEditor from './PageEditor';

export async function generateMetadata({ params }) {
  const page = PAGE_MAP[(await params).key];
  return { title: page ? `Edit page: ${page.label}` : 'Page' };
}

export default async function EditPage({ params }) {
  await requirePage('content.write');
  const { key } = await params;
  const page = PAGE_MAP[key];
  if (!page) notFound();
  const [values, { updatedAt }] = await Promise.all([getPageValues(key), getStoredPage(key)]);

  return (
    <>
      <PageHeader
        back={{ href: '/admin/pages', label: 'Pages & backgrounds' }}
        title={page.label}
        description={updatedAt ? `Last edited ${fmtDate(updatedAt, true)}` : 'Showing the built-in design. Changes go live as soon as you save.'}
        actions={<>
          <a href={page.path} target="_blank" rel="noopener" className={buttonClass('outline')}><ExternalLink className="h-4 w-4" /> View page</a>
          {updatedAt && (
            <form action={resetPageAction.bind(null, key)}>
              <ConfirmButton size="md" variant="outline" message={`Reset “${page.label}” to the built-in text and backgrounds? Your edits and uploaded images for this page will be removed.`}>
                <RotateCcw className="h-4 w-4" /> Reset to default
              </ConfirmButton>
            </form>
          )}
        </>}
      />
      {/* Server action bound here (server component) — binding in the client caused hangs earlier. */}
      <PageEditor groups={page.groups} values={values} action={savePageAction.bind(null, key)} />
    </>
  );
}
