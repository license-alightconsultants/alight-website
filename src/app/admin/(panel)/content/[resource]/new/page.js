import ResourceForm from '@/components/admin/ResourceForm';
import { PageHeader } from '@/components/admin/ui';
import { clientConfig } from '@/lib/admin/resources';
import { loadResource, relationOptions } from '@/lib/admin/resource-data';
import { saveResource } from '@/lib/admin/resource-actions';

export const metadata = { title: 'New item' };

export default async function NewResourcePage({ params }) {
  const { resource } = await params;
  const { res } = await loadResource(resource);
  return (
    <>
      <PageHeader back={{ href: `/admin/content/${resource}`, label: res.label }} title={`New ${res.singular.toLowerCase()}`} />
      <ResourceForm config={clientConfig(res)} action={saveResource.bind(null, resource, null)} options={await relationOptions(res)} />
    </>
  );
}
