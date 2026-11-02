import { notFound } from 'next/navigation';
import { ExternalLink, Trash2 } from 'lucide-react';
import ResourceForm from '@/components/admin/ResourceForm';
import { ConfirmButton } from '@/components/admin/FormBits';
import { PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';
import { clientConfig } from '@/lib/admin/resources';
import { formValues, loadResource, relationOptions } from '@/lib/admin/resource-data';
import { deleteResource, saveResource } from '@/lib/admin/resource-actions';

export const metadata = { title: 'Edit item' };

export default async function EditResourcePage({ params }) {
  const { resource, id: rawId } = await params;
  const { res } = await loadResource(resource);
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const values = await formValues(res, id);
  if (!values) notFound();
  const href = res.publicPath?.(values);

  return (
    <>
      <PageHeader
        back={{ href: `/admin/content/${resource}`, label: res.label }}
        title={values[res.titleField] || `Edit ${res.singular.toLowerCase()}`}
        description={values.updatedAt ? `Last updated ${fmtDate(values.updatedAt, true)}` : undefined}
        actions={<>
          {href && <a href={href} target="_blank" rel="noopener" className={buttonClass('outline')}><ExternalLink className="h-4 w-4" /> View on site</a>}
          <form action={deleteResource.bind(null, resource, id)}>
            <ConfirmButton size="md" message={`Delete “${values[res.titleField]}”? This cannot be undone.`}><Trash2 className="h-4 w-4" /> Delete</ConfirmButton>
          </form>
        </>}
      />
      <ResourceForm config={clientConfig(res)} action={saveResource.bind(null, resource, id)} initial={values} options={await relationOptions(res)} isEdit />
    </>
  );
}
