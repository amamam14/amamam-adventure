import { json } from '@remix-run/node';
import { getClient } from '../../utils/db.server';

export async function action({ request }) {
  const db = await getClient();
  const formData = await request.formData();
  const type = formData.get('type');

  if (!['eat', 'loo', 'sleep'].includes(type)) {
    return json({ error: 'Invalid type' }, { status: 400 });
  }

  if (type === 'eat') {
    await db.collection('eats').insertOne({
      volume: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (type === 'loo') {
    await db.collection('loo').insertOne({
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (type === 'sleeps') {
    await db.collection('sleeps').insertOne({
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return json({ success: true });
}
