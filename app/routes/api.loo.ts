import { json } from '@remix-run/node';
import { getClient } from '~/utils/db.server';

export async function action() {
  const db = await getClient();

  const newEntry = {
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection('loo').insertOne(newEntry);
  return json({ success: true });
}
