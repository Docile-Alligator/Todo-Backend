export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findAllIncomplete(page, pageSize) {

        return await collection.find({completed: false})
            .limit(pageSize)
            .skip(pageSize * page)
            .sort('created')
            .toArray();
    }

    async function findAll(page, pageSize) {
        return await collection.find()
            .limit(pageSize)
            .skip(pageSize * page)
            .sort('created')
            .toArray();
    }

    async function toggleCompleted(todoID, userID, completed) {
        return await collection.updateOne(
            {
                todoID: todoID,
                userID: userID
            },
            {
                $set: {
                    completed: completed
                }
            });
    }

    async function editName(todoID, userID, newName) {
        return await collection.updateOne(
            {
                todoID: todoID,
                userID: userID
            },
            {
                $set: {
                    name: newName
                }
            });
    }

    return {
        insertOne,
        findAllIncomplete,
        findAll,
        toggleCompleted,
        editName
    };
};
