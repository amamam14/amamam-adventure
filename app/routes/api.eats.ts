// app/routes/api/eats.ts
import { json } from '@remix-run/node';
import { getClient } from '~/utils/db.server';

export async function loader() {
  const db = await getClient();
  const [eats] = await Promise.all([
    db.collection('eats').find().sort({ createdAt: -1 }).toArray(),
  ]);

  return json({ eats });
}

export async function action({ request }) {
  const db = await getClient();
  const data = await request.json();
  const volume = data.volume;

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
