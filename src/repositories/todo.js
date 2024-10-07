export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findAllIncomplete(page, pageSize) {
        return await collection.insertOne(page);
    }

    async function findAll(page, pageSize) {
        return await collection.();
    }

    return {
        insertOne
    };
};
