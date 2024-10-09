export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function find(before, after, pageSize, otherConditions = {}) {
        console.log(otherConditions);
        let filter;
        if (after !== 'undefined') {
            filter = { created: { $gt: after }, ...otherConditions };
        } else if (before !== 'undefined') {
            filter = { created: { $lt: before }, ...otherConditions };
        } else {
            filter = { ...otherConditions };
        }
        console.log("filter");
        console.log(filter);
        return await collection.find(filter)
            .limit(pageSize)
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
        find,
        toggleCompleted,
        editName
    };
};
