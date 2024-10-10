export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function find(before, after, pageSize, otherConditions = {}) {
        let filter;
        let sort;
        let isUsingBefore = false;

        if (after !== 'undefined') {
            filter = { created: { $gt: after }, ...otherConditions };
            sort = { created: 1 };
        } else if (before !== 'undefined') {
            filter = { created: { $lt: before }, ...otherConditions };
            sort = { created: -1 };
            isUsingBefore = true;
        } else {
            filter = { ...otherConditions };
            sort = { created: 1 };
        }

        const result = await collection.find(filter)
            .limit(pageSize)
            .sort(sort)
            .toArray();
        return isUsingBefore ? result.reverse() : result;
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
