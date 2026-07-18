import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PrototypeApp from '@/features/app/PrototypeApp';

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/welcome');

  return <PrototypeApp />;
}
