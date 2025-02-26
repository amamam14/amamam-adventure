// app/routes/api/loo.ts
import { json } from '@remix-run/node';
import { getClient } from '~/utils/db.server';

export async function loader() {
  const db = await getClient();
  const [loo] = await Promise.all([
    db.collection('loo').find().sort({ createdAt: -1 }).toArray(),
  ]);

  return json({ loo });
}

export async function action({ request }) {
  const db = await getClient();
  const data = await request.json();
  const type = data.looType;

  const newEntry = {
    type,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection('loo').insertOne(newEntry);
  return json({ success: true });
}
