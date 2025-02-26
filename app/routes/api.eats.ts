// app/routes/api/eats.ts
import { json } from '@remix-run/node';
import { getClient } from '~/utils/db.server';

export async function action({ request }) {
  const db = await getClient();
  const formData = await request.formData();
  const volume = formData.get('volume');

  if (!volume || isNaN(volume)) {
    return json({ error: 'Invalid volume' }, { status: 400 });
  }

  const newEntry = {
    volume: Number(volume),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection('eats').insertOne(newEntry);
  return json({ success: true });
}
