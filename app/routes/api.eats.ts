// app/routes/api/eats.ts
import { json } from '@remix-run/node';
import { ObjectId } from 'mongodb';
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
  const { volume, type, createdAt, id } = data;

  if (request.method === 'DELETE') {
    if (!id) {
      return json({ error: 'Missing entry ID' }, { status: 400 });
    }
    await db.collection('eats').deleteOne({ _id: new ObjectId(id) });
    return json({ success: true, message: 'Entry deleted' });
  }

  const newEntry = {
    type,
    volume: volume ? Number(volume) : 0,
    createdAt: new Date(createdAt),
    updatedAt: new Date(),
  };

  if (id) {
    // Editing an existing entry
    await db
      .collection('eats')
      .updateOne({ _id: new ObjectId(id) }, { $set: newEntry });
    return json({ success: true, message: 'Entry updated' });
  } else {
    // Creating a new entry
    await db.collection('eats').insertOne(newEntry);
    return json({ success: true, message: 'Entry added' });
  }
}
