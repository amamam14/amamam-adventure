import { json } from '@remix-run/node';
import { getClient } from '~/utils/db.server';

export async function loader() {
  const db = await getClient();
  const [sleeps] = await Promise.all([
    db.collection('sleeps').find().sort({ createdAt: -1 }).toArray(),
  ]);

  return json({ sleeps });
}

export async function action() {
  const db = await getClient();

  const newEntry = {
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.collection('sleeps').insertOne(newEntry);
  return json({ success: true });
}
