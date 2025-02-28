// app/routes/api/loo.ts
import { json } from '@remix-run/node';
import { ObjectId } from 'mongodb';
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
  const { createdAt, id, type } = data;

  const newEntry = {
    type,
    createdAt,
    updatedAt: new Date(),
  };

  if (request.method === 'DELETE') {
    if (!id) {
      return json({ error: 'Missing entry ID' }, { status: 400 });
    }
    await db.collection('loo').deleteOne({ _id: new ObjectId(id) });
    return json({ success: true, message: 'Entry deleted' });
  }

  if (id) {
    // Editing an existing entry
    await db
      .collection('loo')
      .updateOne({ _id: new ObjectId(id) }, { $set: newEntry });
    return json({ success: true, message: 'Entry updated' });
  } else {
    // Creating a new entry
    await db.collection('loo').insertOne(newEntry);
    return json({ success: true, message: 'Entry added' });
  }
}
